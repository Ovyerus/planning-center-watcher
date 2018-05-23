const express = require('express');
const expressWS = require('express-ws');
const https = require('https');
const url = require('url');
const config = require('./config.json');

if (!config.applicationID) throw new Error('Configuration is missing `applicationID`.');
if (!config.applicationSecret) throw new Error('Configuration is missing `applicationSecret`.');

const PORT = process.env.PORT || config.port || 8080;
const URL = 'https://api.planningcenteronline.com/check_ins/v2/check_ins?order=created_at&include=location,person&per_page=50';

const app = express();
const appWS = expressWS(app);
const wss = appWS.getWss();
const checkIns = [];

function pollPlanningCenter() {
    console.log('Polling Planning Center...');

    https.get(Object.assign(url.parse(URL), {
        auth: `${config.applicationID}:${config.applicationSecret}`
    })).on('response', res => {
        let chunked = '';
        console.log('Got response');

        res.setEncoding('utf8');
        res.on('data', chunk => chunked += chunk);
        res.on('error', console.error);
        res.on('end', () => {
            handleData(JSON.parse(chunked));
        });
    }).on('error', console.error).end();
}

function heartbeat() {
    this.isAlive = true;
}

function broadcast(data) {
    wss.clients.forEach(ws => ws.send(data));
}

function isToday(timestamp) {
    return new Date(timestamp).toDateString() === new Date().toDateString();
}

function handleData(data) {
    let {data: dataCheckIns, included} = data;
    let removedCheckIns = [];
    let newCheckIns = [];

    for (let {id, attributes, relationships} of dataCheckIns) {
        if ((attributes.checked_out_at && !checkIns.find(x => x.id === id)) ||
            !isToday(attributes.created_at)) continue;

        if (attributes.checked_out_at) {
            removedCheckIns.push(id);
            checkIns.splice(checkIns.findIndex(p => p.id === id));

            continue;
        }

        let cleaned = cleanAttributes(id, attributes, relationships, included);
        
        newCheckIns.push(cleaned);
        checkIns.push(cleaned);
    }

    if (removedCheckIns.length) {
        broadcast(JSON.stringify({
            type: 'checkout',
            people: removedCheckIns
        }));
    }

    if (newCheckIns.length) {
        broadcast(JSON.stringify({
            type: 'checkin',
            people: newCheckIns
        }));
    }
}

function cleanAttributes(id, attr, rel, inc) {
    return {
        id,
        personID: rel.person.data ? rel.person.data.id : id,
        name: `${attr.first_name} ${attr.last_name}`,
        checkedInAt: attr.created_at,
        avatar: rel.person.data
            ? inc.find(v => v.type === 'Person' && v.id === rel.person.data.id).attributes.avatar_url
            : null,
        location: rel.location.data
            ? inc.find(v => v.type === 'Location' && v.id === rel.location.data.id).attributes.name
            : null
    };
}

app.use(express.static('dist'));
app.use((err, req, res, next) => { // eslint-disable-line
    console.log(err);
    res.status(500);
    res.json({error: err.message});
});

app.get('/', (req, res) => {
    res.sendFile('./index.html');
});

app.ws('/ws', (ws, req) => {
    console.log(`New websocket connection from "${req.connection.remoteAddress}"`);
    ws.isAlive = true;

    ws.send(JSON.stringify({
        type: 'checkin',
        people: checkIns
    }));

    ws.on('pong', heartbeat);
});

app.listen(PORT, () => {
    console.log(`Planning Center Viewer available at port ${PORT}.`);
    pollPlanningCenter();
});

setInterval(() => {
    wss.clients.forEach(ws => {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping('', false, true);
    });
}, 15000);

setInterval(pollPlanningCenter, 10000);
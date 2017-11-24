const express = require('express');
const https = require('https');
const url = require('url');
const config = require('./config.json');

const PORT = process.env.PORT || config.port || 8080;
const URL = 'https://api.planningcenteronline.com/check_ins/v2/check_ins?include=location&order=created_at';
const app = express();
const expressWS = require('express-ws')(app);
const wss = expressWS.getWss();
const knownCheckIns = {};

if (!config.applicationID) throw new Error('Configuration is missing `applicationID`.');
if (!config.applicationSecret) throw new Error('Configuration is missing `applicationSecret`.');

setInterval(() => {
    wss.clients.forEach(ws => {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping('', false, true);
    });
}, 15000);

setInterval(() => {
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
}, 10000);

function heartbeat() {
    this.isAlive = true;
}

function isToday(timestamp) {
    return new Date(timestamp).toDateString() === new Date().toDateString();
}

function handleData(data) {
    let {data: checkIns, included} = data;
    let removed = [];
    let new_ = {};
    console.log('handling data')

    for (let {id, type, attributes} of checkIns) {
        if (type !== 'CheckIn' || (attributes.checked_out_at && !knownCheckIns[id]) || !isToday(attributes.created_at)) {
            console.log(isToday(attributes.created_at))
            continue;
        }
        if (attributes.checked_out_at) {
            console.log('deded')
            removed.push(id);
            delete knownCheckIns[id];
            continue;
        }

        console.log('cleansing')
        new_[id] = cleanAttributes(included, attributes);
    }

    if (removed[0]) {
        console.log('delet this')
        wss.clients.forEach(ws => ws.send(JSON.stringify({
            type: 'checkout',
            people: removed
        })));
    }

    if (Object.keys(new_)[0]) {
        console.log('new newn ewnewnew')
        wss.clients.forEach(ws => ws.send(JSON.stringify({
            type: 'checkin',
            people: new_
        })));
    }
}

function cleanAttributes(inc, attr) {
    return {
        firstName: attr.first_name,
        lastName: attr.last_name,
        fullName: `${attr.first_name} ${attr.last_name}`,
        checkedInAt: attr.created_at,
        location: attr.relationships.location.data
            ? inc.find(v => v.type === 'Location' && v.id === attr.relations.location.data.id).attributes.name
            : null
    };
}

app.use(express.static('public'));
app.use((err, req, res, next) => { // eslint-disable-line
    console.log(err);
    res.status(500);
    res.json({error: err.message});
});

app.get('/', (req, res) => {
    res.sendFile('/index.html');
});

app.ws('/ws', (ws, req) => {
    console.log(`New websocket connection from "${req.connection.remoteAddress}"`);
    ws.isAlive = true;

    ws.on('pong', heartbeat);
    //ws.on('message', msg => ws.send(msg));\
    ws.send(JSON.stringify({
        type: 'checkin',
        people: knownCheckIns
    }));
});

app.listen(PORT, () => {
    console.log(`Planning Center Viewer available at port ${PORT}.`);
});
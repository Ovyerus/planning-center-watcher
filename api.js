const express = require('express');
const router = express.Router();

const connKiller = setInterval(() => { // eslint-disable-line
    wss.clients.forEach(ws => {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping('', false, true);
    });
}, 15000);

function heartbeat() {
    this.isAlive = true;
}

router.post('/webhook', (req, res) => {
    console.log(req.body);
    res.sendStatus(200);
});

router.ws('/ws', (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
});

module.exports = router;
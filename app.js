const express = require('express');

const app = express();
const WEBHOOK_ROUTE = '/api/webhook';

app.get('/', (req, res) => {
    res.send('*dab*');
});

app.get(WEBHOOK_ROUTE, (req, res) => {
    console.log(req);
    res.sendStatus(200);
});

app.listen(process.env.PORT || 8080, () => {
    console.log('hoi');
});
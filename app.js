const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const WEBHOOK_ROUTE = '/api/webhook';

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello');
});

app.get(WEBHOOK_ROUTE, (req, res) => {
    console.log(req.body);
    res.sendStatus(200);
});

app.listen(process.env.PORT || 8080, () => {
    console.log('hoi');
});
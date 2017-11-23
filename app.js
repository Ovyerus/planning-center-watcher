const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const expressWS = require('express-ws')(app);

global.wss = expressWS.getWss();

app.use(bodyParser.text());
app.use('/api', require('./api'));
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500);
    res.json({error: err.message});
});

app.get('/', (req, res) => {
    res.send('Hello');
});

app.listen(process.env.PORT || 8080, () => {
    console.log(`Planning Center Viewer available at port ${process.env.PORT || 8080}.`);
});
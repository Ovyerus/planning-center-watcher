/* eslint-env browser */
/* eslint-disable prefer-arrow-callback */

var ws = new WebSocket('ws://' + location.host + '/ws');

ws.addEventListener('open', function() {
    ws.send('hello');
});

ws.addEventListener('message', function(ev) {
    document.body.innerHTML += ev.data;
});

ws.addEventListener('error', function(err) {
    console.error(err);
});


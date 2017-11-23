var ws = new WebSocket('ws://' + location.host + '/api/ws');

ws.addEventListener('open', function() {
    ws.send('hello');
});

ws.addEventListener('message', function(msg) {
    document.body.innerHTML += msg;
});

ws.addEventListener('error', function(err) {
    console.error(err);
});


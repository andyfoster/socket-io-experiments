const   express = require('express'),
        socketio = require('socket.io');

var app = express();
var server = app.listen(8080);
var io = socketio(server);

app.use(express.static('static'));

io.on('connection', (socket) => {
  socket.on('pingFromWeb', () => {
    console.log('Something came from the site, sending a response in 2.. 1...');


    setTimeout(() => {
      socket.emit('HiFromIndexJS', { time: 'The time now is ' + new Date()});
    }, 2000);
  });

});

const   express = require('express'),
        socketio = require('socket.io');

var app = express();
var server = app.listen(8080);
var io = socketio(server);

app.use(express.static('static'));

io.on('connection', (socket) => {
  socket.on('pingFromWeb', (data) => {
    console.log('A user called ' + data.name + ' is on the site');

    let dogName = 'Fluffy Mc' + data.name + ' Flufffluff';
    io.emit('sendDogName', dogName);

  //   setTimeout(() => {
  //     socket.emit('HiFromIndexJS', { time: 'The time now is ' + new Date()});
  //   }, 2000);

  });
});

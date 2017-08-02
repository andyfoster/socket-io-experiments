const   express = require('express'),
        socketio = require('socket.io');

var app = express();
var server = app.listen(8080);
var io = socketio(server);

app.use(express.static('static'));

io.on('connection', (socket) => {
  socket.broadcast.emit('user.events', 'A new user has joined us!');

  socket.on('pingFromWeb', (data) => {
    console.log('A user called ' + data.name + ' is on the site');

    let dogName = 'Fluffy Mc' + data.name + ' Flufffluff';
    socket.broadcast.emit('sendDogName', dogName);
  });
});

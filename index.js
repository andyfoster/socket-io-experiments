const   express = require('express'),
        socketio = require('socket.io'),
        router = require('./routes.js'),
        redis = require('./redis.js');

var app = express();
var server = app.listen(8080);
var io = socketio(server);

// app.use(express.static('static'));
app.use('/', router);
console.log('Starting server...');

var errorEmit = (socket) => {
  return (err) => {
    console.log(err);
    socket.broadcast.emit('user.events', 'Something went wrong!!');
  }
};

var doggifyName = (name) => {
  return 'Fluffy Mc' + name + ' Flufffluff';
};

io.on('connection', (socket) => {
  socket.on('room.join', (room) => {

    // Leave rooms you aren't in
    Object.keys(socket.rooms).filter((room) => room != socket.id)
      .forEach((room) => socket.leave(room));

    // Join the room that the browser tells you to
    // based on their URL
    socket.join(room);
    socket.emit('event', 'Joined room ' + room);

    // Broadcast to all rooms instead
    // socket.broadcast.to(room).emit('event', 'Someone joined room ' + room);

    socket.broadcast.emit('user.events', 'A new user has joined us in room: ' + room);
  });

  // TODO:
  // redis.incrCounter(socket.id);

  socket.on('hello', (data) => {
    console.log('recieved hello');
    console.log(data);
  })

  socket.on('pingFromWeb', (data) => {
    redis.storeUser(socket.id, data.name).then(() => {
      console.log('A user called ' + data.name + ' is on the site');
      let dogName = doggifyName(data.name);
      socket.broadcast.to(data.room).emit('sendDogName', dogName);
    }, errorEmit(socket));
  });

  socket.on('disconnect', () => {
    redis.getUser(socket.id)
      .then((user) => {
        if (user === null) return 'John Doe'
        else return user
      })
      .then((user) => {
        console.log(user + ' just left.');
        socket.broadcast.emit('user.events', user + ' has left the room.')
      }, errorEmit(socket));
  });
});

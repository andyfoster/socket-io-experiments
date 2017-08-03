require('source-map-support/register')
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var express = __webpack_require__(0),
    socketio = __webpack_require__(3),
    router = __webpack_require__(4),
    redis = __webpack_require__(6);

var app = express();
var server = app.listen(8080);
var io = socketio(server);

// app.use(express.static('static'));
app.use('/', router);
console.log('Starting server...');

var errorEmit = function errorEmit(socket) {
  return function (err) {
    console.log(err);
    socket.broadcast.emit('user.events', 'Something went wrong!!');
  };
};

var doggifyName = function doggifyName(name) {
  return 'Fluffy Mc' + name + ' Flufffluff';
};

io.on('connection', function (socket) {
  socket.on('room.join', function (room) {

    // Leave rooms you aren't in
    Object.keys(socket.rooms).filter(function (room) {
      return room != socket.id;
    }).forEach(function (room) {
      return socket.leave(room);
    });

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

  socket.on('hello', function (data) {
    console.log('recieved hello');
    console.log(data);
  });

  socket.on('pingFromWeb', function (data) {
    redis.storeUser(socket.id, data.name).then(function () {
      console.log('A user called ' + data.name + ' is on the site');
      var dogName = doggifyName(data.name);
      socket.broadcast.to(data.room).emit('sendDogName', dogName);
    }, errorEmit(socket));
  });

  socket.on('disconnect', function () {
    redis.getUser(socket.id).then(function (user) {
      if (user === null) return 'John Doe';else return user;
    }).then(function (user) {
      console.log(user + ' just left.');
      socket.broadcast.emit('user.events', user + ' has left the room.');
    }, errorEmit(socket));
  });
});

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__dirname) {var router = __webpack_require__(0).Router();
var path = __webpack_require__(5);

router.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, './static/index.html'));
});

module.exports = router;
/* WEBPACK VAR INJECTION */}.call(exports, "src"))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var config = __webpack_require__(7),
    redis = __webpack_require__(8);

var client = redis.createClient(config.redis_port, config.redis_host);

var promiser = function promiser(resolve, reject) {
  return function (err, data) {
    if (err) reject(err);
    resolve(data);
  };
};

var storeUser = function storeUser(socketID, user) {
  return new Promise(function (resolve, reject) {
    client.setex(socketID, config.expire, user, promiser(resolve, reject));
  });
};

var getUser = function getUser(socketID) {
  return new Promise(function (resolve, reject) {
    client.get(socketID, promiser(resolve, reject));
  });
};

// TODO - log how many users are currently on the system
//
// var createCounter = (socketID) => {
//   return new Promise((resolve, reject) => {
//     client.set(socketID, 'visitorCount', 0, promiser(resolve, reject));
//   });
// };

// var incrCounter = (socketID) => {
//   return new Promise((resolve, reject) => {
//     client.incr(socketID, 'visitorCount');
//   });
// };

// var decrCounter = (socketID) => {
//   return new Promise((resolve, reject) => {
//     client.decr(socketID, 'visitorCount', promiser(resolve, reject));
//   });
// };

module.exports.storeUser = storeUser;
module.exports.getUser = getUser;

// see TODO above
// module.exports.createCounter = createCounter;
// module.exports.incrCounter = incrCounter;
// module.exports.decrCounter = decrCounter;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = {
  redis_host: '127.0.0.1',
  redis_port: 16379,
  expire: 60 * 60 * 1000
};

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("redis");

/***/ })
/******/ ]);
//# sourceMappingURL=main.map
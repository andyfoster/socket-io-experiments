const   config = require('./config.js'),
        redis = require('redis');

var client = redis.createClient(config.redis_port, config.redis_host);

var promiser = (resolve, reject) => {
  return (err, data) => {
    if(err) reject(err);
    resolve(data);
  };
};

var storeUser = (socketID, user) => {
  return new Promise((resolve, reject) => {
    client.setex(socketID, config.expire, user, promiser(resolve, reject));
  });
};

var getUser = (socketID) => {
  return new Promise((resolve, reject) => {
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

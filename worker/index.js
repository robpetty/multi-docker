const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fib(parseInt(message)));
}).on('connect', function () {
    console.log('redis connected');
    console.log(`connected ${redisClient.connected}`);
}).on('error', function (error) {
    console.log(error);
});

sub.subscribe('insert');

sub.on('ready', function () {
   console.log("sub is ready");
});

redisClient.on('ready', function () {
    console.log("pub (redisClient) is ready");
});

/*
// To connect to Redis
const keys = require('./keys');

// make redis client
const redis = require('redis');
//const { redisPort } = require('./keys');

// used to insert into redis server
const redisClient = redis.createClient({
    host: keys.redisHost,
    //port: redisPort,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

// subscrption, listen to redis server for events
const sub = redisClient.duplicate();

// Using recurrsion to make a bit slower
function fib(index) {
    if (index < 2) return 1;
    
    return fib(index - 1) + fib(index - 2);
}

/// act on the insert event, check the message, calculate and insert into redis
sub.on('message', (channel, message) => {
    console.log('Received ' + parseInt(message));

    // insert into hash of values, message becomes the index/key
    redisClient.hset('values', message, fib(parseInt(message)));
});

// listen for someone inserting new Fib index
sub.subscribe('insert');

console.log("subscribed to insert event");
*/
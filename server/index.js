const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// handle all req from React
const app = express();

// allows reqs from different (react) domain to express
app.use(cors());

// turn body into json
app.use(bodyParser.json());

// postgres client setup
const {
    Pool
} = require('pg');

// creats a postgres client pool of clients
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on("connect", (client) => {
    console.log("Creating table called values(INT)");

    client.query('SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = \'schema_name\' AND c.relname = \'table_name\' AND c.relkind = \'r\' -- r = tables ', (err, res) => {
        if (err) {
            console.log("Yo something wrong");
            console.log("------" + res);
        }

        console.log("OK something found");
        console.log("------" + res);
    });

    var result = client
      .query("CREATE TABLE IF NOT EXISTS values (number INT)")
      .catch((err) => console.error(err));

    console.log("After CREATE TABLE query " + result);

    /*
    // confirm table exists now
    client.query("SELECT count(*) from values", (err, res) => {
        if (err) {
          console.log("Bligh me, failure! " + err);
        }
        
        console.log(res.rows);
    });
    */
});

/*

Course updated this code

// simple error handling
pgClient.on('error', () => console.log('Lost PG connection'));

// create new table if it doesn't exist
pgClient.query('CREAT TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.log(err));
*/

// redis client setup
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    // retry every 1 second
    retry_strategy: () => 1000
});

// duplicating because if client is busy, need a,other instant to do other work
const redisPublisher = redisClient.duplicate();

// Express route handlers

// test route
app.get('/', (req, res) => {
    res.send("Hi");
});

// get all indices submitted to postgres
// pgClient can do promise style calls
app.get('/values/all', async (req, res) => {
    console.log("Express reaching to postges to get values");

    const values = await pgClient.query('SELECT * from values');

    // values object has other metadata, just want the values
    console.log("Sending back values " + values.rows + " from postgres");
    res.send(values.rows);
});

// get current values in redis
app.get('/values/current', async (req, res) => {
    console.log("Express reaching to redis to get values");

    // redis does not support promises so have to use callbacks.
    redisClient.hgetall("values", (err, values) => {
        console.log("Sending back values " + values + " from redis");
        res.send(values);
    });
});

// insert new index, limit to max of 40 for index
app.post('/values', async (req, res) => {
    console.log("Exress preparing to send index");

    const index = req.body.index;

    console.log("Index is: " + parseInt(index));

    // max allowed, so fail
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    // put in index (later worker will calculate the value)
    console.log("Adding " + index + " to redis");
    var result = redisClient.hset("values", index, 'Nothing yet!');

    console.log("hset result " + result);

    // publish new insert event, which wakes up the worker
    redisPublisher.publish("insert", index);

    console.log("Now publishing the insert event with index " + index);

    // store index in PG
    pgClient.query("INSERT INTO values(number) VALUES($1)", [index])
        .catch((err) => console.error("===" + err));

    // just confirming something is happening to the caller
    res.send({working: true});
});

    // server setup complete, now just hang loose until req comes
app.listen(5000, err => {
        console.log('Listening');

        var os = require("os");
        var hostname = os.hostname();

        console.log("os.hostname is " + hostname);
});
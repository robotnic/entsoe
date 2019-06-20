const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
console.log('going to connect to postgres');
client.connect();
console.log('connected to postgres');

client.query('CREATE TABLE IF NOT EXISTS keyvalue (key VARCHAR(255) PRIMARY KEY, value json NOT NULL)', (err, res) => {
  console.log(err, res);
 
})
console.log('after create');

module.exports = {
  get: get,
  set: set,
}


function get(key, callback) {
  client.query('SELECT * from keyvalue where key = $1', [key], (err, res) => {
    callback(err, res);
    console.log(err, res);
  });
}

function set(key, value, callback) {
  client.query('INSERT into (key, value values ($1, $2)', [key], (err, res) => {
    callback(err, res);
    console.log(err, res);
  });
}

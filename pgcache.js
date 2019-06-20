const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();

client.query('CREATE TABLE IF NOT EXISTS keyvalue (key VARCHAR(255) NOT NULL PRIMARY KEY, value json NOT NULL')

module.exports = {
  get: get,
  set: set,
}


function get(key) {
  client.query('SELECT * from keyvalue where key = $1', [key], (err, res) => {

  });
}

function set(key, value, callback) {
  client.query('INSERT into (key, value values ($1, $2)', [key], (err, res) => {
    callback(err, res);
    console.log(res);
  });
}

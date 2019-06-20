const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
console.log('going to connect to postgres');
client.connect();
console.log('connected to postgres');

client.query('CREATE TABLE IF NOT EXISTS keyvalue (key VARCHAR(255) PRIMARY KEY, value json NOT NULL)', (err, res) => {
  if (!err) {
    console.log('table created');
  }
 
})
console.log('after create');

module.exports = {
  get: get,
  set: set,
}


function get(key, callback) {
  client.query('SELECT * from keyvalue where key = $1', [key], (err, res) => {
    if (!res.rows[0]) {
      callback(null, null) 
    } else {
      callback(err, res.rows[0]);
    }
  });
}

function set(key, value, callback) {
  client.query('INSERT into (key, value values ($1, $2)', [key, value], (err, res) => {
    callback(err, res);
    console.log(err, res);
  });
}

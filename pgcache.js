const { Client } = require('pg');

//const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://pgcache:pgcache@localhost/pgcache'
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://bernhard@entsoedb:BukBukBukBuk1$@entsoedb.postgres.database.azure.com/pgcache';

console.log('DATABASE_URL', DATABASE_URL);

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: true,
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
  console.log('GET');
  client.query('SELECT * from keyvalue where key = $1', [key], (err, res) => {
    if (!res.rows[0]) {
      callback(null, null) 
    } else {
      callback(err, res.rows[0].value);
    }
  });
}

function set(key, value) {
  if (value) {
    var query = 'INSERT INTO keyvalue (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2'
    console.log('SET', query, key);
    client.query(query, [key, JSON.stringify(value)], (err, res) => {
      console.log(err);
    });
  }
}

client.on('error', function(){
  console.log(arguments);
});

//cache
//const NodeCache = require( "node-cache" );
//const myCache = new NodeCache();

//var cacheManager = require('cache-manager');
//var myCache = cacheManager.caching({store: 'memory', max: 100, ttl: 10/*seconds*/});


var cacheManager = require('cache-manager');
var mongoStore = require('cache-manager-mongodb');

var myCache = cacheManager.caching({
    store : mongoStore,
    uri : "mongodb://127.0.0.1:27017/nodeCacheDb",
    options : {
      collection : "cacheManager",
      compression : false,
      poolSize : 5,
      autoReconnect: true
    }
  });


const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();

client.query("CREATE TABLE IF NOT EXISTS keyvalue (key NOT NULL PRIMARY KEY, value json NOT NULL')



var $q = require('q');

module.exports = {
  get: get,
  set: set
}

var storage = {};

function set(hash, data) {
  var q = $q.defer();
  myCache.set(hash, data);
  q.resolve(data);
  return q.promise;
}

function get(hash, callback, params, refresh) {
  var q = $q.defer();
  if (refresh) {
    getData();
  } else {
    myCache.get(hash, function(err, data){
      if(err) {
        console.log(err);
      } else {
        if (data) {
          console.log('hit', hash);
          q.resolve(data);
        } else {
          getData();
        }
      }
    });
  } 

  function getData() {
    callback.apply(this, params).then(data => {
      myCache.set(hash, data);
      q.resolve(data);
    })
  }

  return q.promise;
}

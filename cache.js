//cache
//const NodeCache = require( "node-cache" );
//const myCache = new NodeCache();

var myCache = require('./pgcache');



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
      if(!data) data = null;
console.log('thedata', data);
        if(data['Acknowledgement_MarketDocument'] && data['Acknowledgement_MarketDocument'].Reason) {
		console.log('herbscht is');
	      q.reject(data);
	} else {
	      q.resolve(data);
	};
    }, e => {
      q.reject(e);
    })
  }

  return q.promise;
}


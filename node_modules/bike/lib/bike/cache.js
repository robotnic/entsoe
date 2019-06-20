/*!
 * Bike
 * Copyright(c) 2012 Gabriele Di Stefano <gabriele.ds@gmail.com>
 * MIT Licensed
 */

var bike = require('../bike')
  , namespace = require('./namespace')
// if node
  , path = require('path')
  ,	_ = require('underscore')
// end  
  ;

/**
 * Manager and placeholder of the cache object.
 * 
 * Examples:
 * 
 *    Bike.cache()
 *    // get all
 *    // => {Object}
 * 
 *    Bike.cache('foo.myclass')
 *    // get
 *    // => {*}
 * 
 *    Bike.cache('foo.myclass', *)
 *    // set
 *    // => {*}
 *
 * @param {[String]} name
 * @param {[*]} value
 * @return {Object|*}
 * @api public
 */

var Cache = function Cache(name, value){
  if(!value && name){
    value = Cache.get(name);
    return value;
  }else if(value && name){
    return Cache.set.apply(this, arguments);
  }
  
  return Cache.items;
};

/**
 * Singletons container.
 *
 * @type {Object}
 * @api private
 */

Cache.singletons = {};

/**
 * Cache container.
 *
 * @type {Object}
 * @api private
 */

// if node
Cache.items = global;
// end
// if browser
//Cache.items = window;
// end
  
/**
 * Get an element from the cache container.
 *
 * @param {String} name
 * @return {*|null}
 * @api public
 */

Cache.get = function(name){
  if(!_.isString(name)) return name;
  
  var parent = Cache.items
    , seed = null
    , seeds = name.split(bike.delimiter)
    , name = _.last(seeds)
    ;

  for(var i = 0; i < seeds.length-1; i++){
    seed = seeds[i];
    
    if(!parent[seed]){
      Cache.require( seeds, 0 );
    };

    parent = parent[seed];
  };
  
  if(!parent[name]) {
    Cache.require( seeds, 1 );
  }
  
  return parent[name] ? parent[name].$bike : null;
};

/**
 * Add or replace a element in the cache container.
 *
 * Returns the give element;
 * 
 * @param {String} name
 * @param {*} value
 * @return {*}
 * @api public
 */

Cache.set = function(name, value){

  var parent = Cache.items
    , seed = null
    , seeds = name.split(bike.delimiter)
    , name = _.last(seeds)
    ;

  for(var i = 0; i < seeds.length-1; i++){
    seed = seeds[i];
    
    if(!parent[seed]){
      parent[seed] = {};
    }
    parent = parent[seed];
  };

  if(parent[name]){
    parent[name].$name = name;
    parent[name].$bike = value;
  }else{
    parent[name] = {
      $name: name,
      $bike: value
    };
  }
  
  return parent[name].$bike;
};

/**
 * To be implemented. Removes an element from the cache container.
 * 
 * Returns the cache container.
 *
 * @param {String} name
 * @return {Object}
 * @api public
 */

Cache.remove = function(name){
  
  // NEED TO CLEAR ALSO THE CACHE OF nodejs require
  // with the "may" required cached object
  // so it will be reloaded
  // because otherwise the define function wont run again 
  
  return Cache.items;
};

/**
 * Empty the cache container and returns it.
 *
 * @return {Object}
 * @api public
 */

Cache.clear = function(){
  return Cache.items = {};
};

/**
 * Requires from `@node require` the missing library. 
 *
 * @param {String} name
 * @return {*|null}
 * @api private
 */

Cache.require = function(name, status){
  var seeds = null
    , link = null
    ;
  
  if(_.isArray(name)){
    seeds = name;
    name = name.join(bike.delimiter);  
  }else{
    seeds = name.split(bike.delimiter);
  }
  
  link = namespace.get(name);
  
  if(!link){
    return false;
  }
  
  var req;
  
  try{
    // Look for behere/lib/behere/*.js    
    req = require(link.target + '/' + _.last(seeds, (seeds.length - link.name.split(bike.delimiter).length)).join('/'));
    
  }catch(e){
     
    if(seeds.length <= 2){
      // Look for any "behere-*" module
      // example:
      // behere.aaa => behere-aaa
      req = require(name.replace('.','-'));
      
    }else{
      // Look for child files "behere-*/lib/*/*"
      // example:
      // behere.aaa.bbb.ccc.ddd => behere-aaa/lib/aaa/bbb/ccc/ddd
      req = [];
      
      for(var i=0; i<seeds.length; i++){
        if(i===0){
          req.push(seeds[i]);
        }else if(i===1){
          req[0] += ('-' + seeds[i]);
          req.push('lib', seeds[i]);
        }else{
          req.push(seeds[i]);
        }
      };
      
      req = require(req.join('/'));
      
    }
    
  }
  
  return req;
};

/*!
 * Exports.
 */

exports = module.exports = Cache;
 
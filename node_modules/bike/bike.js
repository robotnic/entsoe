(function() {

// CommonJS require()

function require(p){
    var path = require.resolve(p)
      , mod = require.modules[path];
    if (!mod) throw new Error('failed to require "' + p + '"');
    if (!mod.exports) {
      mod.exports = {};
      mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
  }

require.modules = {};

require.resolve = function (path){
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js';
    return require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  };

require.register = function (path, fn){
    require.modules[path] = fn;
  };

require.relative = function (parent) {
    return function(p){
      if ('.' != p.charAt(0)) return require(p);
      
      var path = parent.split('/')
        , segs = p.split('/');
      path.pop();
      
      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if ('..' == seg) path.pop();
        else if ('.' != seg) path.push(seg);
      }

      return require(path.join('/'));
    };
  };


require.register("bike.js", function(module, exports, require){
/*!
 * Bike
 * Copyright(c) 2012 Gabriele Di Stefano <gabriele.ds@gmail.com>
 * MIT Licensed
 */


/**
 * Bike.
 * 
 * @api private
 */

var Bike = exports = module.exports = function Bike(){
  return Bike.attach.apply(Bike, arguments);
};

/**
 * Library version.
 * 
 * Returns a string in the form of `n.n.n`.
 * 
 * @type {String}
 * @api public
 */

Bike.version = '0.5.4';
  
/**
 * Delimiter used among namespaces.
 * 
 * Default `.`.
 *
 * @type {String}
 * @api public
 */

Bike.delimiter = '.';

/**
 * Namespace manager reference.
 *
 * @return {Object}
 * @see bike/namespace.js
 * @api public
 */

Bike.namespace = require('./bike/namespace');

/**
 * Cache manager reference.
 *
 * @return {Object}
 * @see bike/cache.js
 * @api public
 */

Bike.cache = require('./bike/cache');

/**
 * Base object interpolation.
 * 
 * @return {Object}
 * @see bike/base.js
 * @api private
 */

Bike.base = require('./bike/base');;

/**
 * Attaches methods `define` and `create` on a given object.
 *
 * Returns the given object.
 * 
 * @param {Object} target
 * @return {Object}
 * @api public
 */

Bike.attach = Bike.extend = function(target, namespaces){
  if(target){
    target.define = Bike.define;
    target.create = Bike.create;
    target.namespace = Bike.namespace;
  }
  
  if(namespaces){
    Bike.namespace(namespaces);
  }
  
  return Bike;
};

/**
 * Defines in the `Bike.cache` a new object.
 *
 * Returns the cached object.
 * 
 * @param {String} name
 * @param {Object} options
 * @param {[Function]} callback
 * @return {Object}
 * @api public
 */

Bike.define = function(name, plain, options, callback){
  var obj = null
    ;
  
  if(!_.isBoolean(plain)){
    callback = options;
    options = plain;
    plain = false;
  }
  
  if(!plain){
    if(options && options.extend){
      obj = Bike.cache.get(options.extend);
      
      delete options.extend;
    }else{
      obj = Bike.base;
    }
    
    if(options){
      obj = Bike.base.extend(options, obj);
    }
  
    if(options && options.mixins){
      options.mixins.forEach(function(mixin){
        mixin = Bike.cache.get(mixin);
        obj = Bike.base.mixin(mixin, obj);
      });
      
      delete options.mixins;
    }
    
  }else{
    // plain
    obj = options;
  }
  
  Bike.cache.set(name, obj);
  
  if(callback){
    callback.apply(obj, [name, options]);
  }
  
  return obj;
};

/**
 * Creates a new object giving a namespace and options
 *
 * Returns the object just created.
 * 
 * @param {String} name
 * @param {Object} options
 * @param {[Function]} callback
 * @return {Object}
 * @api public
 */

Bike.create = function(name, plain, options, callback){
  var obj = Bike.cache.get(name)
    , isSingleton = false
    ;
  
  if(!_.isBoolean(plain)){
    callback = options;
    options = plain;
    plain = false;
  }
  
  if(!plain){
    if((obj && obj.hasOwnProperty('singleton') && obj.singleton) || (options && options.singleton)){
      isSingleton = true;
    }
    
    if(options){
      obj = Bike.base.extend(options, obj);
    }
    
    if(isSingleton){
      
      if(_.has(Bike.cache.singletons, name)){
        obj = Bike.cache.singletons[name];
      }else{
        obj = Bike.cache.singletons[name] = Bike.base.create.call(obj, options || {});
        
        if(callback){
          callback.apply(obj, [name, options]);
        } 
      }
      
    }else{
      obj = Bike.base.create.call(obj, options || {});
      
      if(callback){
        callback.apply(obj, [name, options]);
      } 
    }
  }else{
    // plain
    obj = new obj();
  }
  
  return obj;
};
}); // module: bike.js

require.register("bike/proto.js", function(module, exports, require){
/*!
 * Bike
 * Copyright(c) 2012 Gabriele Di Stefano <gabriele.ds@gmail.com>
 * MIT Licensed
 */


if(typeof Object.create !== 'function'){
  /**
   * Object.create
   * 
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
   */
  Object.create = function(obj){
    if(arguments.length > 1){
      throw new Error('Object.create implementation only accepts the first parameter.');
    }

    function F() {}
    F.prototype = obj;

    return new F();
  };
};

if(typeof Object.getPrototypeOf !== 'function'){
  /**
   * Object.getPrototypeOf
   * 
   * @see http://ejohn.org/blog/objectgetprototypeof/
   */  
  if(typeof 'test'.__proto__ === 'object'){
    Object.getPrototypeOf = function(object){
      return object.__proto__;
    };
  }else{
    Object.getPrototypeOf = function(object){
      return object.constructor.prototype;
    };
  }
};

/**
 * Proto.
 * Thanks to uberproto
 * 
 * @see http://github.com/daffl/uberproto
 */

var Proto = exports = module.exports = {
  
  /**
   * Create a new object using Object.create. The arguments will be
   * passed to the new instances init method or to a method name set in
   * __init.
   */
  
  create: function(){
    var instance = Object.create(this)
      , init = _.isString(instance.__init) ? instance.__init : 'initialize'
      ;
      
    if(_.isFunction(instance[init])){
      instance[init].apply(instance, arguments);
    }
    
    return instance;
  },
  
  /**
   * Mixin a given set of properties
   * @param prop The properties to mix in
   * @param obj [optional] The object to add the mixin
   */
  
  mixin: function(prop, obj){
    var self = obj || this
      , fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/
      , _super = Object.getPrototypeOf(self) || self.prototype
      , oldFn
      ;

    // Copy the properties over
    for(var name in prop){
      // store the old function which would be overwritten
      oldFn = self[name];
      // Check if we're overwriting an existing function
      self[name] = (_.isFunction(prop[name]) && _.isFunction(_super[name]) && fnTest.test(prop[name]))
        || (_.isFunction(oldFn) && _.isFunction(prop[name]))
        ? (function(old, name, fn){return function(){
            
          var tmp = this._super;

          // Add a new ._super() method that is the same method
          // but either pointing to the prototype method
          // or to the overwritten method
          this._super = (_.isFunction(old)) ? old : _super[name];

          // The method only need to be bound temporarily, so we
          // remove it when we're done executing
          var ret = fn.apply(this, arguments);
          this._super = tmp;
          
          return ret;
      }})(oldFn, name, prop[name])
      : prop[name];
      
      if((name == self.__init || name == prop.__init) && _.isFunction(self[name])){
         //self[name] = _.once(self[name]);
        self[name] = self[name];
      }
    }

    return self;
  },
  
  /**
   * Extend the current or a given object with the given property
   * and return the extended object.
   * @param prop The properties to extend with
   * @param obj [optional] The object to extend from
   * @returns The extended object
   */
  
  extend: function(attrs, obj){
    return this.mixin(attrs, Object.create(obj || this));
  },
  
  /**
   * Return a callback function with this set to the current or a given context object.
   * @param name Name of the method to prox
   * @param context [optional] The object to use as the context
   */
  
  proxy: function(name, obj){
    var self = obj || this
      ;
    
    return function(){
      return self[name].apply(self, arguments);
    }
  }
  
}

}); // module: bike/proto.js

require.register("bike/base.js", function(module, exports, require){
/*!
 * Bike
 * Copyright(c) 2012 Gabriele Di Stefano <gabriele.ds@gmail.com>
 * MIT Licensed
 */

var Proto = require('./proto')
  ;

/**
 * Base.
 */

var Base = exports = module.exports = Proto.extend({
  
  //__init : 'initialize'
  
});
 
}); // module: bike/base.js

require.register("bike/namespace.js", function(module, exports, require){
/*!
 * Bike
 * Copyright(c) 2012 Gabriele Di Stefano <gabriele.ds@gmail.com>
 * MIT Licensed
 */


/**
 * Manager and placeholder of the namespace object.
 * 
 * Examples:
 * 
 *    Bike.namespace()
 *    // get all
 *    // => []
 * 
 *    Bike.namespace('foo')
 *    // get
 *    // => String
 * 
 *    Bike.namespace('foo', './my/path/to/it')
 *    // set
 *    // => String
 *
 * @param {[String]} name
 * @param {[String]} value
 * @return {String}
 * @api public
 */

var Namespace = function Namespace(name, value){
  if(_.isString(name)){
    //single
    if(!value && name){
      value = Namespace.get(name);
      return value ? value.target : null;
    }else if(value && name){
      return Namespace.set.apply(this, arguments);
    }
  }else{
    //multiple
    for(var i in name){
      Namespace(i, name[i]);
    }
  }
  return Namespace.items;
};

/**
 * Namespace container.
 *
 * @type {Array}
 * @api private
 */

Namespace.items = [];

/**
 * Get the target of a given namespace.
 *
 * @param {String} name
 * @return {String|null}
 * @api public
 */

Namespace.get = function(name){
  return _.find(Namespace.items.sort(function(first, second){
    return second.name.length - first.name.length;
  }), function(link){
    return (name.indexOf(link.name) != -1);
  });
  
  return null;
};

/**
 * Add or replace a target of a given namespace.
 *
 * Returns the give target;
 * 
 * @param {String} name
 * @param {String} value
 * @return {String}
 * @api public
 */

Namespace.set = function(name, value){
  var ns
    ;
  
  if(!_.find(Namespace.items, function(ns){
    return ns.name === name;
  })){
    ns = Namespace.items[Namespace.items.push({
      name: name,
      target: value
    }) - 1];
  }else{
    ns = Namespace.get(name);
    ns.target = value;
  }
  
  return ns;
};

/**
 * Removes a namespace.
 * 
 * Returns the namespace container.
 *
 * @param {String} name
 * @return {Array}
 * @api public
 */

Namespace.remove = function(name){
  return Namespace.items = _.reject(Namespace.items, function(ns){
    return ns.name == name;
  });
};

/**
 * Empty the namespace container and returns it.
 *
 * @return {Array}
 * @api public
 */

Namespace.clear = function(){
  return Namespace.items = [];
};

/*!
 * Exports.
 */

exports = module.exports = Namespace;

}); // module: bike/namespace.js

require.register("bike/cache.js", function(module, exports, require){
/*!
 * Bike
 * Copyright(c) 2012 Gabriele Di Stefano <gabriele.ds@gmail.com>
 * MIT Licensed
 */

var bike = require('../bike')
  , namespace = require('./namespace')
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

Cache.items = window;
  
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
 
}); // module: bike/cache.js

window.bike = require("bike");
})();

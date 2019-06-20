/*!
 * Bike
 * Copyright(c) 2012 Gabriele Di Stefano <gabriele.ds@gmail.com>
 * MIT Licensed
 */

// if node
var _ = require('underscore')
  ;
// end

// if browser
//if(typeof Object.create !== 'function'){
//  /**
//   * Object.create
//   * 
//   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
//   */
//  Object.create = function(obj){
//    if(arguments.length > 1){
//      throw new Error('Object.create implementation only accepts the first parameter.');
//    }
//
//    function F() {}
//    F.prototype = obj;
//
//    return new F();
//  };
//};
// end

// if browser
//if(typeof Object.getPrototypeOf !== 'function'){
//  /**
//   * Object.getPrototypeOf
//   * 
//   * @see http://ejohn.org/blog/objectgetprototypeof/
//   */  
//  if(typeof 'test'.__proto__ === 'object'){
//    Object.getPrototypeOf = function(object){
//      return object.__proto__;
//    };
//  }else{
//    Object.getPrototypeOf = function(object){
//      return object.constructor.prototype;
//    };
//  }
//};
// end

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

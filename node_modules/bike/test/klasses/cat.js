var Bike = require('../../')
  ;

Bike.define('test.cat', {
  extend: 'test.animal',
  name: function(){
    return this._super.apply(this, arguments) + ' cat'
  }
});
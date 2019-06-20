var Bike = require('../../')
  ;

Bike.define('test.playfull', {
  name: function(){
    return this._super.apply(this, arguments) + ', very playfull!!';
  }
});
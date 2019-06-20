var Bike = require('../')
  , assert = require('assert')
  , path = require('path')
  ;


describe('Bike', function(){
  
  /*
   * #version
   */

  describe('#version', function(){
		
    it('should have a valid format', function(){
      /^\d+\.\d+\.\d+$/.test(Bike.version).should.be.ok
    })
      
  })
  
  /*
   * #attach()
   */

  describe('#attach()', function(){

    var fn = function(){}
      , obj = new fn();
        
    it('should add to an object both functions define and create', function(){
      Bike.attach(obj);
      obj.define.should.be.an.instanceof(Function);
      obj.create.should.be.an.instanceof(Function);
    })
    
    it('should return the given object', function(){
     Bike.attach(obj).create.should.be.an.instanceof(Function);
    })
      
  })
  
  /*
   * #define()
   */
  
  describe('#define(), #create()', function(){    
      
    it('should define a klass in the cache', function(){
      Bike.define('kls_1', {
        ciao: function(){
          return 'hello'
        }
      });
      
      Bike.create('kls_1').ciao().should.equal('hello')
    })
    
    it('should extend a klass from the cache', function(){
      Bike.define('kls_2', {
        extend: 'kls_1',
        ciao: function(){
          return this._super.apply(this, arguments) + ' ciao'
        }
      });
      
      Bike.create('kls_2').ciao().should.equal('hello ciao')
    })
    
    it('should define a class inside an existing namespace', function(){
      Bike.define('kls_2.kls_3', {
        extend: 'kls_2',
        ciao: function(){
          return this._super.apply(this, arguments) + ' hola'
        }
      });
      
      Bike.create('kls_2.kls_3').ciao().should.equal('hello ciao hola')
    })
    
    it('should try to require object if not already defined', function(){
      Bike.namespace('test', path.join(__dirname, 'klasses'))
      Bike.create('test.cat').name().should.equal('animal cat')
    })
    
    it('should mix objects', function(){
      Bike.namespace('test', path.join(__dirname, 'klasses'))
      Bike.create('test.sophie').name().should.equal('Ciao, sono Sophie ! animal cat, very playfull!!')
    })
    
    it('should initialize just once the class', function(){
      Bike.define('count', {
        singleton: true,
        count: '1'
      });
      
      var a = Bike.create('count');
      var b = Bike.create('count');
      
      a.count.should.equal('1');
      b.count.should.equal('1');
      
      a.count = '2';
      
      a.count.should.equal('2');
      b.count.should.equal('2');
    })
    
    it('should work with a custom constructor name', function(){
      Bike.define('aaa', {
        __init: 'initialize',
        name: 'Angelo',
        speak: function(){
          return this.name;
        }
      });
      
      Bike.define('bbb', {
        extend: 'aaa',
        speak: function(){
          return this._super.apply(this, arguments);
        }
      });
      
      var bbb = Bike.create('bbb',{
        initialize: function(){
          this.name = 'Gabriele'
        }
      });
      
      bbb.speak().should.equal('Gabriele')
    })
    
    it('should extend from Bike.base and have initialize as init method', function(){
      /*
      Bike.define('ccc', Bike.base);
      
      Bike.define('ddd', {
        extend: 'ccc',
        name: 'Gabriele',
        initialize: function(){
          this.name += '!!!';
        }
      });
      
      var ddd = Bike.create('ddd');
      
      ddd.name.should.equal('Gabriele!!!')
      */
    })
    
  })
  
})
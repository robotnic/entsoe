var Bike = require('../')
  , assert = require('assert')
  ;


describe('Bike', function(){
  
  /*
   * #namespace()
   */
  
  describe('#namespace()', function(){  
    
    it('should return an array', function(){    
      Bike.namespace().should.be.an.instanceof(Array);
    })
    
    it('should set namespaces with name and target properties', function(){
      var ns = Bike.namespace('foo', '-/foo/-');
      ns.should.be.a('object');
      ns.should.have.property('name', 'foo');
      ns.should.have.property('target', '-/foo/-');
    })
    
    it('should override the target if the name already exist', function(){
      var ns = Bike.namespace('foo', 'foo---');
      ns.should.be.a('object');
      ns.should.have.property('name', 'foo');
      ns.should.have.property('target', 'foo---');
    })
    
    it('should return the target related to the given name', function(){
      var ns = Bike.namespace('sophie', 'cat');
      Bike.namespace('sophie').should.equal('cat');
    })
    
    /*
     * #clear()
     */

    describe('#clear()', function(){
  
      it('should clear namespace and return an array', function(){
        Bike.namespace.clear();
        Bike.namespace('foo', '-/foo/-');
        Bike.namespace().should.be.an.instanceof(Array).with.lengthOf(1);
        Bike.namespace.clear().should.be.an.instanceof(Array).with.lengthOf(0);
        Bike.namespace().should.be.an.instanceof(Array).with.lengthOf(0);
      })
  
    })
    
    /*
     * #remove()
     */

    describe('#remove()', function(){
      
      it('should return the items', function(){
        Bike.namespace.remove().should.be.an.instanceof(Array);
      })
      
      it('should remove a give item and return items', function(){
        Bike.namespace.clear();
        
        Bike.namespace.set('meme','cat white');
        Bike.namespace.set('sophie','cat orange');
        
        Bike.namespace().should.be.an.instanceof(Array).with.lengthOf(2);
        Bike.namespace.remove('sophie').should.be.an.instanceof(Array);
        Bike.namespace().should.be.an.instanceof(Array).with.lengthOf(1);
      })
  
    })
    
  })
  
})
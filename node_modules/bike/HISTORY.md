# History

0.6.0 / (roadmap)
------------------

  * Add more tests
  * Add examples
  * Add examples on code comments
  * Make README usage documentation
  * Add singletons get/set/remove (used by klass#create()) in the cache object
  * Change browser build version with https://github.com/LearnBoost/browserbuild
  * Make `version` variable replace with * directly in MakeFile

0.5.4 / 2012-07-04
------------------

  * Made `initialize` the default init method

0.5.3 / 2012-06-30
------------------

  * Added namespaces variable to set namespaces directly on Bike.extend

0.5.2 / 2012-06-29
------------------

  * Bike.attach is deprecated. Use Bike.extend
  
0.5.1 / 2012-06-14
------------------

  * Renamed from `behere-klass` to `bike`

0.4.6 / 2012-06-12
------------------

  * Added tests (24)
  * Changed order of definition: extend then mixins.
  
0.4.4 / 2012-05-19
------------------

  * #cache.attach() changed #ns() to #namespace(), removed #klass
  * Added singleton functionality
  * Updated to uberproto 1.0.2 (custom init method name)
  * Created Klass.base, native class for all extensions
  * Added tests (23)
  * __init function is now configured to be called just once, no matter what.
  * Added browser support. Now Klass can be used on node and on the browser :-)

0.4.3 / 2012-05-06 (stable)
------------------

  * Cache taken to global scope
  * Added namespace `ns` on the attach method
  * Created tests (20)
  * Bug fixed on cache.get, removed return `.prototype`

0.4.2 / 2012-05-01 (stable)
------------------

  * Comments on cache
  * Comments on namespace
  
0.4.1 / 2012-04-25 (stable)
------------------

  * Refactor of code
  * Written comments on code
  * Added documentation builder with `make docs`

0.4.0 / 2012-04-20 (stable)
------------------

  * Refactor of code
  * Added `delimiter` property

0.3.0 / 2012-04-20 (unstable)
------------------

  * Refactor of code
  * Added tests suite with "mocha" and "should"
  * Added automatic test support thanks to travis-ci.org
  * Created tests (19)
  * Prepared code comments for documentation

0.0.1 / 2012-04-16 
------------------

  * Created the project
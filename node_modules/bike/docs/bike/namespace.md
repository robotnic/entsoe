
# Namespace()

  Manager and placeholder of the namespace object.
  
  ## Examples
  
     Bike.namespace()
     // get all
     // => []
  
     Bike.namespace('foo')
     // get
     // => String
  
     Bike.namespace('foo', './my/path/to/it')
     // set
     // => String

# Namespace.get()

  Get the target of a given namespace.

# Namespace.set()

  Add or replace a target of a given namespace.
  
  Returns the give target;

# Namespace.remove()

  Removes a namespace.
  
  Returns the namespace container.

# Namespace.clear()

  Empty the namespace container and returns it.
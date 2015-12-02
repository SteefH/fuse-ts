# fuse-ts #

*fuse-ts* is a dependency injection library for TypeScript.
It allows you to use a `fused` decorator on your TypeScript classes, so that
when an instance of that class is constructed, it will receive instances of
the types the class depends on. A small example might clarify this:

```typescript
import {fuse, fused} from 'fuse';

class Service {
  someMethod() { }
}

class ServiceImplementation implements Service {
  someMethod() { }
}

@fused
class ServiceConsumer {
  constructor(public service?: Service) { }
}

// let fuse know that all Service dependencies are
// to be instances of ServiceImplementation
fuse(Service).to(ServiceImplementation);

var serviceConsumer: ServiceConsumer = new ServiceConsumer();

// this will be true
var isServiceImplementation: boolean = serviceConsumer.service instanceof ServiceImplementation;
```

As you can see in the example, the `ServiceConsumer` constructor has one
optional argument of the type `Service`. Upon creating an instance by using
`new ServiceConsumer()`, _fuse_ will for each constructor argument look for a
type that has been "fused" to the type of that argument, and pass an instance.
In the example that's
`ServiceImplementation` for the first (and only) argument of the constructor.
This is made possible by using the `@fused` decorator on the `ServiceConsumer`
class.

_...work in progress..._

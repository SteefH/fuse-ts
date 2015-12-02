# fuse-ts #

[![Build Status](https://travis-ci.org/SteefH/fuse-ts.svg?branch=master)](https://travis-ci.org/SteefH/fuse-ts)

*fuse-ts* is a [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) library for
TypeScript. It allows you to use a `@fused` decorator on your TypeScript classes, so that when an instance
of that class is constructed, it will receive instances of the types the class depends on.

## Basic example ##
```typescript
import {fuse, fused} from 'fuse';

class Service {
  public someMethod(): void { }
}

class ServiceImplementation implements Service {
  public someMethod(): void { }
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
type that has been "fused" to the type of that argument, inject an instance in
the constructor. So, in the example, a `ServiceImplementation` instance is
injected in the `ServiceConsumer` constructor. This is made possible by the
`@fused` decorator on the `ServiceConsumer` class.

### Important ###

To use _fuse-ts_ in your project, make sure you use the following in your _tsconfig.json_ file:

```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

## In depth ##

### Decorated classes ###

When you decorate a TypeScript class with `@fused`, the class's constructor is wrapped by another function
that resolves values for the original constructor's arguments, based on their type. For convenience, it
is preferable to make all the constructor's arguments you want injected optional, so you can call the constructor without TypeScript compiler complaints. Like this:

```typescript
@fused
class Component {
  constructor(a?: A, b?: B) {
    // stuff
  }
}

var component = new Component();
```

The following won't compile:

```typescript
@fused
class Component {
  constructor(a: A, b: B) {
    // stuff
  }
}

// TypeScript compiler will fail on the following line
var component = new Component();
```

If there are arguments you always want to pass to the constructor (ie. never injected by _fuse-ts_), make them
required:

```typescript
@fused
class Component {
  constructor(value: number, a?: A, b?: B) {
    // stuff
  }
}

var component = new Component(1);
```

### Injected types ###

To make a type injectable, it must be registered with the library. This is done by calling
`fuse(BaseType).to(InjectedType)`. See the following example:

```typescript
class BaseType {
  public someMethod(): void { }
}

class InjectedType implements BaseType {
  public someMethod(): void {
    // stuff
  }
}

// register with fuse-ts
fuse(BaseType).to(InjectedType);
```

You probably noticed that `InjectedType` implements a class instead of a TypeScript interface. Since
interfaces are a design-time feature of TypeScript, they are not available in the transpiled JavaScript at
run time. Because of that and the way _fuse-ts_ works (for now), interfaces are unsuitable as a type to
resolve to. So the following won't work:

```typescript
interface Foo {
  fooIt(): void;
}

class InjectedFoo implements Foo {
  public fooIt(): void {
    // stuff
  }
}

// register with fuse-ts
fuse(Foo).to(InjectedFoo); // Compilation fails with "Cannot find name 'Foo'"
```

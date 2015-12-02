/// <reference path="../typings/mocha/mocha.d.ts"/>
/// <reference path="../typings/chai/chai.d.ts"/>
/// <reference path="../typings/sinon/sinon.d.ts"/>
/// <reference path="../typings/sinon-chai/sinon-chai.d.ts"/>
import * as chai from 'chai';
import * as sinon from 'sinon';
import sinonChai = require('sinon-chai');

var expect = chai.expect;
chai.use(sinonChai);

import {fuse, fused} from '../fuse';


describe('fuse', () => {
	beforeEach(() => {
		fuse.reset();
	});
	class Foo {
		method(): void { };
	}

	class ConcreteFoo implements Foo {
		public method() { }
	}

	it('should bind', () => {
		fuse(Foo).to(ConcreteFoo);
		var instance: Foo = fuse.build(Foo);
		expect(instance).to.be.instanceof(ConcreteFoo);
	});

	it('should overwrite old bindings', () => {
		class OtherFoo implements Foo {
			public method() { }
		}
		var instance: Foo;

		fuse(Foo).to(ConcreteFoo);
		instance = fuse.build(Foo);

		expect(instance).to.be.instanceof(ConcreteFoo);

		fuse(Foo).to(OtherFoo);
		instance = fuse.build(Foo);

		expect(instance).not.to.be.instanceof(ConcreteFoo);
		expect(instance).to.be.instanceof(OtherFoo);
	});

	it('should allow binding a type to itself', () => {
		var instance: ConcreteFoo;

		fuse(ConcreteFoo).toSelf();
		instance = fuse.build(ConcreteFoo);

		expect(instance).to.be.instanceof(ConcreteFoo);
	});

	context('building', () => {
		it('returns undefined when trying to build an unbound type', () => {
			var instance: Foo;

			instance = fuse.build(Foo);

			expect(instance).to.be.undefined;
		});
		context('a transient binding', () => {
			it('builds new objects on each build', () => {
				var firstInstance: Foo;
				var secondInstance: Foo;

				fuse(Foo).to(ConcreteFoo).asTransient();
				firstInstance = fuse.build(Foo);
				secondInstance = fuse.build(Foo);

				expect(firstInstance).to.be.instanceof(ConcreteFoo);
				expect(secondInstance).to.be.instanceof(ConcreteFoo);
				expect(firstInstance).not.to.equal(secondInstance);
			});
		});
		context('a singleton binding', () => {
			it('returns the same object on each build', () => {
				var firstInstance: Foo;
				var secondInstance: Foo;

				fuse(Foo).to(ConcreteFoo).asSingleton();
				firstInstance = fuse.build(Foo);
				secondInstance = fuse.build(Foo);

				expect(firstInstance).to.be.instanceof(ConcreteFoo);
				expect(secondInstance).to.be.instanceof(ConcreteFoo);
				expect(firstInstance).to.equal(secondInstance);
			});
			it('calls the bound constructor only once on repeated builds', () => {
				var firstInstance: Foo;
				var secondInstance: Foo;

				var spyRef = { ConcreteFoo };
				var spy: Sinon.SinonSpy = sinon.spy(spyRef, 'ConcreteFoo');

				fuse(Foo).to(spyRef.ConcreteFoo).asSingleton();
				firstInstance = fuse.build(Foo);
				secondInstance = fuse.build(Foo);

				expect(spy).to.be.calledOnce;
			});
		});
	});
});

describe('fused-decorated class', () => {

	class TransientService {
		serviceMethod(): void { };
	};

	class TransientServiceImplementation implements TransientService {
		serviceMethod(): void { };
	};

	class SingletonService {
		singletonServiceMethod(): void { }
	}

	class SingletonServiceImplementation implements SingletonService {
		singletonServiceMethod(): void {}
	}

	class Unbound {
		someMethod(): void { }
	}
	interface Bar {
		flurp(): void;
	}

	@fused
	class ServiceConsumer {
		constructor(
			public transientService?: TransientService,
			public transientService2?: TransientService,
			public singletonService?: SingletonService,
			public singletonService2?: SingletonService,
			public unbound?: Unbound,
			public bar?: Bar
		) { }
	}

	beforeEach(() => {
		fuse.reset();
		fuse(TransientService).to(TransientServiceImplementation).asTransient();
		fuse(SingletonService).to(SingletonServiceImplementation).asSingleton();
		fuse(ServiceConsumer).toSelf();
	});
	context('when instantiated with fuse.build()', () => {
		var instance: ServiceConsumer;
		beforeEach(() => {
			instance = fuse.build(ServiceConsumer);
		});

		it('is an instance of the right type', () => {
			expect(instance).to.be.instanceof(ServiceConsumer);
		});

		it('receives different instances for transient bindings', () => {
			expect(instance.transientService).to.be.instanceof(TransientServiceImplementation);
			expect(instance.transientService2).to.be.instanceof(TransientServiceImplementation);
			expect(instance.transientService).not.to.equal(instance.transientService2);
		});

		it('receives the same instance for singleton bindings', () => {
			expect(instance.singletonService).to.be.instanceof(SingletonServiceImplementation);
			expect(instance.singletonService2).to.be.instanceof(SingletonServiceImplementation);
			expect(instance.singletonService).to.equal(instance.singletonService2);
		});

		it('is injected with undefined for unbound types', () => {
			expect(instance.unbound).to.be.undefined;
		});

		it('receives positional arguments passed to fuse.build() instead of injected instances', () => {
			class OtherServiceImplementation implements TransientService {
				serviceMethod() {}
			}

			instance = fuse.build(ServiceConsumer, new OtherServiceImplementation());
			expect(instance.transientService).to.be.instanceof(OtherServiceImplementation);
			expect(instance.transientService2).to.be.instanceof(TransientServiceImplementation);

			instance = fuse.build(ServiceConsumer, undefined, undefined, undefined, undefined);
			expect(instance.transientService).to.be.undefined;
			expect(instance.transientService2).to.be.undefined;
			expect(instance.unbound).to.be.undefined;
			expect(instance.bar).to.be.undefined;
		});

	});

	context('when instantiated with new', () => {

		var instance: ServiceConsumer;
		beforeEach(() => {
			instance = new ServiceConsumer();
		});

		it('is an instance of the right type', () => {
			expect(instance).to.be.instanceof(ServiceConsumer);
		});

		it('receives different instances for transient bindings', () => {
			expect(instance.transientService).to.be.instanceof(TransientServiceImplementation);
			expect(instance.transientService2).to.be.instanceof(TransientServiceImplementation);
			expect(instance.transientService).not.to.equal(instance.transientService2);
		});

		it('receives the same instance for singleton bindings', () => {
			expect(instance.singletonService).to.be.instanceof(SingletonServiceImplementation);
			expect(instance.singletonService2).to.be.instanceof(SingletonServiceImplementation);
			expect(instance.singletonService).to.equal(instance.singletonService2);
		});

		it('is injected with undefined for unbound types', () => {
			expect(instance.unbound).to.be.undefined;
		});

		it('receives positional arguments passed to the constructor instead of injected instances', () => {
			class OtherServiceImplementation implements TransientService {
				serviceMethod() {}
			}

			instance = new ServiceConsumer(new OtherServiceImplementation());
			expect(instance.transientService).to.be.instanceof(OtherServiceImplementation);
			expect(instance.transientService2).to.be.instanceof(TransientServiceImplementation);

			instance = fuse.build(ServiceConsumer, undefined, undefined, undefined, undefined, undefined, undefined);
			expect(instance.transientService).to.be.undefined;
			expect(instance.transientService2).to.be.undefined;
			expect(instance.singletonService).to.be.undefined;
			expect(instance.singletonService2).to.be.undefined;
			expect(instance.unbound).to.be.undefined;
			expect(instance.bar).to.be.undefined;
		});

	});
});

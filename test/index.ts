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

beforeEach(() => {
	fuse.reset();
});

describe('fuse', () => {
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

	class Service {
		serviceMethod() { };
	};

	class ServiceImplementation implements Service {
		serviceMethod() { };
	};

	class Unbound {
		someMethod() { }
	}
	interface Bar {
		flurp(): void;
	}

	@fused
	class ServiceConsumer {
		constructor(
			public service?: Service,
			public service2?: Service,
			public unbound?: Unbound,
			public bar?: Bar
		) { }
	}
	context('when instantiated with fuse.build()', () => {
		beforeEach(() => {
			fuse(Service).to(ServiceImplementation).asSingleton();
			fuse(ServiceConsumer).toSelf();
		});

		it('is injected with instances for bound types in its constructor', () => {
			var instance: ServiceConsumer;

			instance = fuse.build(ServiceConsumer);

			expect(instance).to.be.instanceof(ServiceConsumer);
			expect(instance.service).to.be.instanceof(ServiceImplementation);
			expect(instance.service2).to.be.instanceof(ServiceImplementation);
			expect(instance.service).to.equal(instance.service2);
		});
		it('is injected with undefined for unbound types in its constructor', () => {
			var instance: ServiceConsumer;

			instance = fuse.build(ServiceConsumer);

			expect(instance).to.be.instanceof(ServiceConsumer);
			expect(instance.unbound).to.be.undefined;
		});
		it('receives positional arguments passed to fuse.build() instead of injected instances', () => {
			var instance: ServiceConsumer;
			class OtherServiceImplementation implements Service {
				serviceMethod() {}
			}

			instance = fuse.build(ServiceConsumer, new OtherServiceImplementation());
			expect(instance.service).to.be.instanceof(OtherServiceImplementation);

			instance = fuse.build(ServiceConsumer, undefined, undefined, undefined, undefined);
			expect(instance.service).to.be.undefined;
			expect(instance.service2).to.be.undefined;
			expect(instance.unbound).to.be.undefined;
			expect(instance.bar).to.be.undefined;

		});

	});

	context('when instantiated with new', () => {
		beforeEach(() => {
			fuse.reset();
			fuse(Service).to(ServiceImplementation).asSingleton();
			fuse(ServiceConsumer).toSelf();
		});

		it('is injected with instances for bound types in its constructor', () => {
			var instance: ServiceConsumer;

			instance = new ServiceConsumer();

			expect(instance).to.be.instanceof(ServiceConsumer);
			expect(instance.service).to.be.instanceof(ServiceImplementation);
			expect(instance.service2).to.be.instanceof(ServiceImplementation);
			expect(instance.service).to.equal(instance.service2);
		});
		it('is injected with undefined for unbound types in its constructor', () => {
			var instance: ServiceConsumer;

			instance = new ServiceConsumer();

			expect(instance).to.be.instanceof(ServiceConsumer);
			expect(instance.unbound).to.be.undefined;
		});
		it('receives positional arguments passed to fuse.build() instead of injected instances', () => {

			class OtherServiceImplementation implements Service {
				serviceMethod() {}
			}
			var instance: ServiceConsumer;

			instance = new ServiceConsumer(new OtherServiceImplementation());

			expect(instance).to.be.instanceof(ServiceConsumer);
			expect(instance.service).to.be.instanceof(OtherServiceImplementation);

			instance = new ServiceConsumer(undefined, undefined, undefined, undefined);

			expect(instance.service ).to.be.undefined;
			expect(instance.service2).to.be.undefined;
			expect(instance.unbound ).to.be.undefined;
			expect(instance.bar     ).to.be.undefined;

		});

	});
});

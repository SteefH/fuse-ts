/// <reference path="../typings/mocha/mocha.d.ts"/>
/// <reference path="../typings/chai/chai.d.ts"/>
/// <reference path="../typings/sinon/sinon.d.ts"/>
/// <reference path="../typings/sinon-chai/sinon-chai.d.ts"/>
import * as chai from 'chai';
import * as sinon from 'sinon';
import  sinonChai = require('sinon-chai');

var expect = chai.expect;
chai.use(sinonChai);

import {Container, Binding} from '../fuse';


describe('Container', () => {
	class IFoo {
		method(): void {};
	}


	class ConcreteFoo implements IFoo {
		public method() { }
	}

	class OtherFoo implements IFoo {
		public method() {}
	}

	var container: Container = null;
	beforeEach(() => {
		container = new Container();
	});
	context('binding', () => {
		it('should bind', () => {
			container.bind(IFoo).to(ConcreteFoo);
			var instance: IFoo = container.build(IFoo);
			expect(instance).to.be.instanceof(ConcreteFoo);
		});

		it('should overwrite old bindings', () => {
			container.bind(IFoo).to(ConcreteFoo);
			container.bind(IFoo).to(OtherFoo);
			var instance: IFoo = container.build(IFoo);
			expect(instance).not.to.be.instanceof(ConcreteFoo);
			expect(instance).to.be.instanceof(OtherFoo);
		});
	});
	context('building', () => {
		it('returns null when trying to build an unbound type', () => {
			var instance: IFoo = container.build(IFoo);
			expect(instance).to.equal(null);
		});
		context('transient binding', () => {
			it('builds new objects on each build', () => {
				container.bind(IFoo).to(ConcreteFoo).asTransient();;
				var firstInstance: IFoo = container.build(IFoo);
				var secondInstance: IFoo = container.build(IFoo);
				expect(firstInstance).to.be.instanceof(ConcreteFoo);
				expect(secondInstance).to.be.instanceof(ConcreteFoo);
				expect(firstInstance).not.to.equal(secondInstance);
			});
		});
		context('singleton binding', () => {
			it('returns the same object on each build', () => {
				container.bind(IFoo).to(ConcreteFoo).asSingleton();
				var firstInstance: IFoo = container.build(IFoo);
				var secondInstance: IFoo = container.build(IFoo);
				expect(firstInstance).to.be.instanceof(ConcreteFoo);
				expect(secondInstance).to.be.instanceof(ConcreteFoo);
				expect(firstInstance).to.equal(secondInstance);
			});
			it('calls the bound constructor only once on repeated builds', () => {
				var spyRef = { ConcreteFoo };
				var spy: Sinon.SinonSpy = sinon.spy(spyRef, 'ConcreteFoo');
				container.bind(IFoo).to(spyRef.ConcreteFoo).asSingleton();
				var firstInstance: IFoo = container.build(IFoo);
				var secondInstance: IFoo = container.build(IFoo);
				expect(spy).to.be.calledOnce;
			});
		});
		context('constructor argument passing', () => {
			it('passes the parameters to the bound constructor', () => {
				
				var spyRef = { ConcreteFoo };
				var spy: Sinon.SinonSpy = sinon.spy(spyRef, 'ConcreteFoo');

				container.bind(IFoo).to(spyRef.ConcreteFoo);

				var instance: IFoo = container.build(IFoo, 1, 2, 3);
				expect(instance).to.be.instanceof(ConcreteFoo);
				expect(spy).to.have.been.calledWith(1, 2, 3);
			});
		});
	});
});


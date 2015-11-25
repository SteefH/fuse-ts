
import {expect} from 'chai';

import {Container} from '../fuse/container/index';


describe('A fuse container', () => {
	class IFoo {
		method(): void {};
	}

	class OtherFoo implements IFoo {
		public method() {}
	}

	class ConcreteFoo implements IFoo {

		public method() { }
	}

	it('should bind', () => {
		var container: Container = new Container();
		container.bind(IFoo).to(ConcreteFoo);
		var instance: IFoo = container.build(IFoo);
		expect(instance).to.be.instanceof(ConcreteFoo);
	});

	it('should allow rebinding', () => {
		var container: Container = new Container();
		container.bind(IFoo).to(ConcreteFoo);
		container.bind(IFoo).to(OtherFoo);
		var instance: IFoo = container.build(IFoo);
		expect(instance).not.to.be.instanceof(ConcreteFoo);
		expect(instance).to.be.instanceof(OtherFoo);
	});
});


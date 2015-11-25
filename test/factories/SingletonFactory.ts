
import {expect} from 'chai';

import {SingletonFactory, ConstructorArgs} from '../../fuse/factories';

describe('SingletonFactory', () => {

	class Klass {
		constructor(arg1: boolean) {};
	}



	it('Should instantiate a class given a constructor', () => {
		var factory: SingletonFactory<Klass> = new SingletonFactory(Klass);
		var instance = factory.build();
		expect(instance).to.be.instanceof(Klass);
	});

	it('Should instantiate a class only once', () => {
		var factory: SingletonFactory<Klass> = new SingletonFactory(Klass);
		var firstInstance = factory.build();
		var secondInstance = factory.build();
		expect(firstInstance).to.be.instanceof(Klass).and.to.equal(secondInstance);
	});

	it('Should pass the right arguments to the constructor', () => {
		var factory: SingletonFactory<Klass> = new SingletonFactory(Klass);
		class KlassConstructorArgs implements ConstructorArgs<Klass> {
			getArgs() {
				return [true];
			}
		}
		var instance = factory.build(new KlassConstructorArgs());
		expect(instance).to.be.instanceof(Klass);
	});
});
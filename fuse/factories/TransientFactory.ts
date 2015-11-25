
import {Constructor, Factory, ConstructorArgs} from './Factory';

export class TransientFactory<T> implements Factory<T> {

	private _instanceConstructor: Constructor<T>;
	constructor(instanceConstructor: Constructor<T>) {
		this._instanceConstructor = instanceConstructor;
	}

	public build<A extends ConstructorArgs<T>>(constructorArgs?: A): T {
		var args: any[] = [];
		if (constructorArgs) {
			args = constructorArgs.getArgs();
		}
		return new this._instanceConstructor(...args);
	}
}
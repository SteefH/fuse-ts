
import {Constructor, Factory, ConstructorArgs} from './Factory';

export class TransientFactory<T> implements Factory<T> {

	private _instanceConstructor: Constructor<T>;
	constructor(instanceConstructor: Constructor<T>) {
		this._instanceConstructor = instanceConstructor;
	}

	public build(...constructorArgs: any[]): T {
		return new this._instanceConstructor(...constructorArgs);
	}
}
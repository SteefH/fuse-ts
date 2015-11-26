import {Factory, ConstructorArgs} from './Factory';
import {TransientFactory} from './TransientFactory';

export class SingletonFactory<T> extends TransientFactory<T> {
	private _instance: T = undefined;
	public build(...constructorArgs: any[]): T {
		if (this._instance === undefined) {
			this._instance = super.build(...constructorArgs);
		}
		return this._instance;
	}
}
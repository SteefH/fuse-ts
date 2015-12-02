export interface Constructor<T> {
	new (...params: any[]): T
}

export interface Factory<T> {
	build(...constructorArguments: any[]): T;
}

export class TransientFactory<T> implements Factory<T> {

	constructor(private instanceConstructor: Constructor<T>) { }

	public build(...constructorArguments: any[]): T {
		return new this.instanceConstructor(...constructorArguments);
	}
}

export class SingletonFactory<T> extends TransientFactory<T> {
	private instance: T = undefined;

	public build(...constructorArguments: any[]): T {
		if (this.instance === undefined) {
			this.instance = super.build(...constructorArguments);
		}
		return this.instance;
	}
}

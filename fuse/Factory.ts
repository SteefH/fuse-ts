export interface Constructor<T> {
	new (...params: any[]): T
}

export interface Factory<T> {
	build(): T;
}

export class TransientFactory<T> implements Factory<T> {

	constructor(private instanceConstructor: Constructor<T>) { }

	public build(): T {
		return new this.instanceConstructor();
	}
}

export class SingletonFactory<T> extends TransientFactory<T> {
	private instance: T = undefined;

	public build(): T {
		if (this.instance === undefined) {
			this.instance = super.build();
		}
		return this.instance;
	}
} 

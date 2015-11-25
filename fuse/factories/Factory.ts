export interface Constructor<T> {
	new (...params: any[]): T
}

export interface ConstructorArgs<T> {
	getArgs(): any[];
}

export interface Factory<T> {
	build<A extends ConstructorArgs<T>>(constructorArgs?: A): T;
}
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts"/>

import {Factory, SingletonFactory, TransientFactory, Constructor} from './Factory';
import {Registry} from './Registry';
import 'reflect-metadata';

export interface Binding<T> {
	asSingleton(): void;
	asTransient(): void;
}

class RegistryBinding<T> implements Binding<T>, Factory<T> {

	private factory: Factory<T>;

	constructor(private constructor: Constructor<T>) {
		this.factory = new TransientFactory(constructor);
	}

	asSingleton() {
		this.factory = new SingletonFactory(this.constructor);
	}

	asTransient() {
		this.factory = new TransientFactory(this.constructor);
	}

	build(...constructorArguments: any[]): T {
		return this.factory.build(...constructorArguments);
	}
}


export interface BindingSubject<T> {
	to<C extends T>(constructor: Constructor<C>): Binding<T>;
	toSelf(): Binding<T>;
}

class Subject<T> implements BindingSubject<T> {

	constructor(private registry: Registry, private baseConstructor: Constructor<T>) {}

	to<C extends T>(constructor: Constructor<C>): Binding<T> {
		var binding: RegistryBinding<C> = new RegistryBinding(constructor);
		this.registry.add(this.baseConstructor, binding);
		return binding;
	}
	toSelf(): Binding<T> {
		var binding: RegistryBinding<T> = new RegistryBinding(this.baseConstructor);
		this.registry.add(this.baseConstructor, binding);
		return binding;
	}
}



export class Container {
	private registry: Registry;

	constructor() {
		this.reset();
	}
	reset(): void {
		this.registry = new Registry();
	}
	public bind<T>(baseConstructor: Constructor<T>): BindingSubject<T> {
		return new Subject<T>(this.registry, baseConstructor);
	}
	public build<T>(baseConstructor: Constructor<T>, ...constructorArguments: any[]): T {
		var binding: Factory<T> = this.registry.get(baseConstructor);
		if (binding) {
			return binding.build(...constructorArguments);
		}
	}

	private findFactories(argumentTypes: any[]): Factory<any>[] {
		return argumentTypes.map(
			(argumentType: Constructor<any>) => this.registry.get(argumentType)
		);
	}

	public createDecorator(): (<T>(targetClass: Constructor<T>) => any) {
		var findFactories = this.findFactories.bind(this);

		return function <T>(targetClass: Constructor<T>): any {
			var argumentTypes: any[] = Reflect.getMetadata("design:paramtypes", targetClass);
			function newConstructor(): any {
				var originalArguments = [].slice.call(arguments);
				var remainingArgumentTypes = argumentTypes.slice(originalArguments.length);
				var injectedArguments: any[] = findFactories(remainingArgumentTypes).map(
					(factory: Factory<any>) => factory && factory.build()
				);
				targetClass.call(this, ...originalArguments, ...injectedArguments);
			}
			newConstructor.prototype = targetClass.prototype;
			return newConstructor;
		}
	}
};

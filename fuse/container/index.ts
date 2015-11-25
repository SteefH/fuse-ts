
import {Factory, SingletonFactory, TransientFactory, Constructor} from '../factories';
import {Registry} from './Registry';

export interface Binding<T> {
	asSingleton(): void;
	asTransient(): void;
	build(): T;
}


export class RegistryBinding<T> implements Binding<T> {
	
	private _factory: Factory<T>; 

	constructor(private cons: Constructor<T>) {
		this._factory = new TransientFactory(cons);
	}

	asSingleton() {
		this._factory = new SingletonFactory(this.cons);
	}
	asTransient() {
		this._factory = new TransientFactory(this.cons);
	}

	build(): T {
		return this._factory.build();
	}
}


export interface BindingSubject<T> {
	to<C extends T>(c: Constructor<C>): Binding<T>;
}

class Subject<T> implements BindingSubject<T> {

	constructor(private registry: Registry, private baseCons: Constructor<T>) {}

	to<C extends T>(c: Constructor<C>): Binding<T> {
		var binding: Binding<C> = new RegistryBinding(c);
		return this.registry.add(this.baseCons, binding);
	}
}

export class Container {
	private _registry: Registry;
	constructor() {
		this._registry = new Registry();
	}
	public bind<T>(base: Constructor<T>): BindingSubject<T> {
		return new Subject<T>(this._registry, base);
	}
	public build<T>(c: Constructor<T>): T {
		var binding: Binding<T> = this._registry.get(c);
		if (binding) {
			return binding.build();
		}
		return null;
	}
};
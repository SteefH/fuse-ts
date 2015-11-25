import {Constructor, Factory, SingletonFactory, TransientFactory} from '../factories';
import {Binding} from './index';

interface ConstructorMapping {
	[i: string]: any;
}

interface RegisteredConstructor {
	__registrationId?: string;
}


export class Registry {
	private _constructors: ConstructorMapping = {};
	private static _nextFuseId: number = 0;
	add<T>(baseCons: Constructor<T>, binding: Binding<T>): Binding<T> {
		var registeredConstructor = (baseCons as RegisteredConstructor);
		if (!registeredConstructor.__registrationId) {
			registeredConstructor.__registrationId = `$fused-${Registry._nextFuseId}`;
			Registry._nextFuseId += 1;
		}
		this._constructors[registeredConstructor.__registrationId] = binding;
		return binding;
	}
	
	public get<T>(baseCons: Constructor<T>): Binding<T> {
		var fused = (baseCons as RegisteredConstructor);
		var fuser = this._constructors[fused.__registrationId];
		return fuser;
	}
}

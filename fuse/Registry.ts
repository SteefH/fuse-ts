import {Constructor, Factory} from './Factory';

interface ConstructorMapping {
	[i: string]: any;
}

interface RegisteredConstructor {
	__registrationId?: string;
}

export class Registry {
	private constructors: ConstructorMapping = {};
	private static nextFuseId: number = 0;
	add<T>(baseCons: Constructor<T>, registree: Factory<any>): Factory<any> {
		var registeredConstructor = (baseCons as RegisteredConstructor);
		if (!registeredConstructor.__registrationId) {
			registeredConstructor.__registrationId = `$fused-${Registry.nextFuseId}`;
			Registry.nextFuseId += 1;
		}
		this.constructors[registeredConstructor.__registrationId] = registree;
		return registree;
	}
	
	public get<T>(baseCons: Constructor<T>): Factory<any> {
		var registeredConstructor = (baseCons as RegisteredConstructor);
		return this.constructors[registeredConstructor.__registrationId];
	}
}

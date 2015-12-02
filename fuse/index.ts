import {Constructor} from './Factory';
export {Constructor} from './Factory';
import {Container, BindingSubject} from './Container';
export {BindingSubject} from './Container';

var container = new Container();
export var fused: <T>(ctor: Constructor<T>) => any = container.createDecorator();

export interface Fuse {
	<T>(baseConstructor: Constructor<T>): BindingSubject<T>;
	reset(): void;
	build<T>(baseConstructor: Constructor<T>, ...constructorArguments: any[]): T;
}

export var fuse: Fuse = <Fuse>function fuse<T>(baseConstructor: Constructor<T>): BindingSubject<T> {
	return container.bind(baseConstructor);
};

fuse.reset = function (): void {
	container.reset();
}

fuse.build = function<T>(baseConstructor: Constructor<T>, ...constructorArguments: any[]): T {
	return container.build(baseConstructor, ...constructorArguments);
}

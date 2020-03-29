type FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any
	? U
	: any;

function unproxy<T>(proxy: FunctionProxy<T>): T {
	return new Proxy(proxy as any, {
		get: (target, property) => (proxy as any)[property](),
		enumerate: () => Object.keys(proxy),
	});
}

function mergeLazy<A, B>(a: A, b: B): A & B {
	return new Proxy({} as any, {
		get: (target, key) => (key in a ? (a as any)[key] : (b as any)[key]),
		enumerate: () => Object.keys(a).concat(Object.keys(b)),
	});
}

type FunctionProxy<T> = {
	[U in keyof T]: () => T[U];
};
type DeepFunctionProxy<T> = {
	[U in keyof T]: FunctionProxy<T[U]>;
};

export function singleton<T extends Array<any>, U>(fn: (...args: T) => U) {
	let value: U;
	return (...args: T) => {
		if (!value) {
			value = fn(...args);
		}
		return value;
	};
}

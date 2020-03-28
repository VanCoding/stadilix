type FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any
	? U
	: any;

function makeProxy<A, B>(a: A, b: B): A & B {
	return new Proxy({} as any, {
		get: (target, property) => {
			if (property in a) return (a as any)[property];
			return (b as any)[property];
		},
	});
}

export function singleton<T extends Array<any>, U>(fn: (...args: T) => U) {
	let value: U;
	return (...args: T) => {
		if (!value) {
			value = fn(...args);
		}
		return value;
	};
}

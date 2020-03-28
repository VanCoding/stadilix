export function makeLogger({}) {
	console.log("creating logger");
	return {
		log: (text: string) => console.log(text),
	};
}

export type Logger = ReturnType<typeof makeLogger>;

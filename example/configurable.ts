import { Logger } from "./logger";

export function makeConfigurable({ logger }: { logger: Logger }) {
	return {
		configurableFunction: () => {
			logger.log("log from configurable");
		},
	};
}

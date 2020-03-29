import { Logger } from "./logger";
export function makeRepository({ logger }: { logger: Logger }) {
	return {
		repositoryFunction: () => logger.log("hi from repository")
	};
}

import { Logger } from "./logger";

interface Repository {
	repositoryFunction(): void;
}

export interface Configurable {
	configurableFunction(): void;
}

export function makeService({
	repository,
	configurable,
	logger,
	port
}: {
	repository: Repository;
	configurable: Configurable;
	logger: Logger;
	port: number;
}) {
	return {
		serviceFunction: () => {
			console.log("hi from service");
			console.log("port: " + port);
			repository.repositoryFunction();
			configurable.configurableFunction();
			logger.log("log from service");
		}
	};
}

export type Service = ReturnType<typeof makeService>;

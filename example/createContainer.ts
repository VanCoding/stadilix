import { createContainer } from "../ts-static-di/index";
import { writeFileSync } from "fs";

const container = createContainer();
container.register("./service", [
	{
		name: "makeService",
		alias: "service",
		local: ["port"],
		runtime: false,
	},
	{
		name: "Configurable",
		alias: "configurable",
		runtime: true,
	},
]);
container.register("./repository", [
	{
		name: "makeRepository",
		alias: "repository",
		runtime: false,
	},
]);
container.register("./logger", [
	{
		name: "makeLogger",
		alias: "logger",
		runtime: false,
	},
]);

writeFileSync("./example/container.ts", container.build());

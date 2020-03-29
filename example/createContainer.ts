import { createContainer } from "../ts-static-di/index";
import { writeFileSync } from "fs";

const container = createContainer();
container.register("./service", [
	{
		name: "makeService",
		alias: "service",
		local: ["port"],
	},
]);
container.register("./repository", [
	{
		name: "makeRepository",
		alias: "repository",
	},
]);
container.register("./logger", [
	{
		name: "makeLogger",
		alias: "logger",
		singleton: true,
	},
]);

writeFileSync("./example/container.ts", container.build());

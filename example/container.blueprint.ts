import { createBuilder } from "../src/index";

const container = createBuilder(__dirname);
container.registerAll({
	paths: ["./**"],
	except: ["app.ts", "container*", "configurable.ts"],
});
container.registerManuals(["service"], ["port"]);
container.buildToFile(__dirname + "/container.ts");

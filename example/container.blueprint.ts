import { createBuilder } from "../src/index";

const builder = createBuilder(__dirname);
builder.registerAll({
	paths: ["./**"],
	except: ["app.ts", "container*", "configurable.ts"],
});
builder.registerManuals(["service"], ["port"]);
builder.buildToFile(__dirname + "/container.ts");

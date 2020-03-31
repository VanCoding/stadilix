# stadilix

A static dependency-injection library/compiler heavily inspired by awilix.

## purpose

While dependency injection libraries make wiring together all application components very convenient, they usually sacrifice type safety. This means you'll have to start the application, to find out that there are some missing dependencies. It's also not checked, if the dependeny satisfies the expected type.

Stadilix solves this problem, by generating a typescript file containing a fully typed container. This way, if dependencies are missing, or are of a wrong format, your editor/compiler will tell you before even starting the applicaiton. It can also help you filling up missing dependencies using autocomplete.

## state of this project

This library is still very experimental and should not be used in production. It's still a proof of concept, and the API may change dramatically.

## how to use

1. create a blueprint file, for example "container.blueprint.ts". In this, build a container file using the stadilix builder. Here's an example:

```ts
import { createBuilder } from "../src/index";

//create a builder, it'll resolve files from the given path
const container = createBuilder(__dirname);

//tell the builder, which files it should auto-resolve
//currently, all such files must be factory functions, no classes or static values are currently supported
container.registerAll({
	paths: ["./**"], //here we say all files
	except: ["app.ts", "container*", "configurable.ts"], //except app.ts, "configurable.ts" and all files starting with "container"
});

//tell the builder, which dependencies we'll provide manually for each module
container.registerManuals(["service"], ["port"]); //here we say, that we'll provide the dependency "port" for the module "service" manually.

//build the container.ts file
container.buildToFile(__dirname + "/container.ts");
```

2. run the blueprint file to generate the container file

3. import the container, and use it to bootstrap your application

```ts
//app.ts
import Container from "./container";
import { makeConfigurable } from "./configurable";

const container = Container((container) => ({
	global: {
		// we need to specify configurable here, because we excluded it in the blueprint, but some dependencies need it
		configurable: () => makeConfigurable(container),
	},
	local: {
		// we need to provide a port for the module "service" here, because we said so in the blueprint
		service: { port: () => 80 },
	},
	// here we could define which modules are not singletons and a new instance shall be created each time they are injected somewhere
	// typesafe, of course
	nonSingletons: [],
}));

//access any module in the container
container.service.serviceFunction();
```

## drawbacks

- There's an additional compilation step
- Still experimentalW
- A lot of features are missing

## contributing

I'm very welcome to opinions about the library and ideas how to improve it. Just open a GitHub issue.

## License

MIT

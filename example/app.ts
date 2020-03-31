import Container from "./container";
import { makeConfigurable } from "./configurable";

const container = Container((container) => ({
	global: {
		configurable: () => makeConfigurable(container),
	},
	local: {
		service: { port: () => 80 },
	},
	nonSingletons: [],
}));

container.service.serviceFunction();

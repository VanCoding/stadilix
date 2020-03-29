import Container, { singleton } from "./container";
import { makeConfigurable } from "./configurable";

const container = Container(container => ({
	global: {
		configurable: singleton(() => makeConfigurable(container))
	},
	local: {
		service: { port: () => 80 }
	}
}));

container.service.serviceFunction();

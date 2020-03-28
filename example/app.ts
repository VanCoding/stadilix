import Container from "./container";
import { makeConfigurable } from "./configurable";

const container = Container(container => ({
	global: {
		get configurable() {
			return makeConfigurable(container);
		}
	},
	local: {
		service: { port: 80 }
	}
}));

container.service.serviceFunction();

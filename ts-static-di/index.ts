import { format } from "prettier";
import { readFileSync } from "fs";

interface Source {
	path: string;
	definitions: Definition[];
}
interface Definition {
	name: string;
	alias: string;
	local?: string[];
	runtime?: boolean;
	singleton?: boolean;
}

const utilities = readFileSync(__dirname + "/utilities.ts") + "";

export function createContainer() {
	const files: Source[] = [];
	return {
		register: (path: string, definitions: Definition[]) => {
			files.push({ path, definitions });
		},
		build: () => {
			const imports =
				`` +
				files
					.map((file) => {
						return `import {${file.definitions.map(
							(d) => d.name + " as value_" + d.alias
						)}} from "${file.path}"`;
					})
					.join("\n") +
				"\n\n";

			const containerType =
				"interface Container extends ManualGlobalDependencies {\n" +
				files
					.map((file) =>
						file.definitions
							.map((definition) => {
								if (definition.runtime) {
									return "";
								}
								return `${definition.alias}: ReturnType<typeof value_${definition.alias}>;`;
							})
							.join("")
					)
					.join("") +
				"}\n";

			const globalType =
				"interface ManualGlobalDependencies {" +
				files
					.map((file) =>
						file.definitions
							.map((definition) => {
								return !definition.runtime
									? ""
									: definition.alias + ": value_" + definition.alias + ";";
							})
							.join("")
					)
					.join("") +
				"}";
			const localType =
				"interface ManualLocalDependencies {" +
				files
					.map((file) =>
						file.definitions
							.map((definition) => {
								const values = definition.local
									? definition.local
											.map(
												(local) =>
													`${local}: FirstArgument<typeof value_${definition.alias}>["${local}"];`
											)
											.join("")
									: "";
								return values ? definition.alias + ": {" + values + "}" : "";
							})
							.join("")
					)
					.join("") +
				"}";
			const functionDefinition = `export default function(build: (container: Container)=>{global: FunctionProxy<ManualGlobalDependencies>, local: DeepFunctionProxy<ManualLocalDependencies>}){`;

			const container =
				"let container: Container;const {global,local} = build(container=unproxy({" +
				files
					.map((file) =>
						file.definitions
							.map((definition) => {
								if (definition.runtime) {
									return `${definition.alias}:()=>global.${definition.alias}(),`;
								} else {
									return `${definition.alias}:${
										definition.singleton ? "singleton(" : ""
									}()=>value_${definition.alias}(${
										definition.local && definition.local.length
											? `mergeLazy(unproxy(local.${definition.alias}),container)`
											: "container"
									})${definition.singleton ? ")" : ""},`;
								}
							})
							.join("")
					)
					.join("") +
				"}));";
			const functionEnd = "return container;}";
			return format(
				imports +
					utilities +
					containerType +
					globalType +
					localType +
					functionDefinition +
					container +
					functionEnd,
				{ parser: "typescript" }
			);
		},
	};
}

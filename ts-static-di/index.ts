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

			const autoDependenciesType =
				"interface AutoDependencies {\n" +
				files
					.map((file) =>
						file.definitions
							.map((definition) => {
								return `${definition.alias}: ReturnType<typeof value_${definition.alias}>;`;
							})
							.join("")
					)
					.join("") +
				"}\n";

			const allDependenciesType =
				"type AllDependencies = " +
				files
					.map((file) =>
						file.definitions
							.map((definition) => {
								const except = definition.local
									? definition.local.map((local) => `"${local}"`).join("|")
									: "";
								const type = `FirstArgument<typeof value_${definition.alias}>`;
								return except ? `Omit<${type},${except}>` : type;
							})
							.filter((l) => l)
							.join("&")
					)
					.filter((l) => l)
					.join("&") +
				";";

			const containerType =
				"type Container = AllDependencies & AutoDependencies;";

			const globalType =
				"type ManualGlobalDependencies = Omit<Container,keyof AutoDependencies>;";

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
				"let container: Container;const {global,local} = build(container=unproxy(mergeLazy(singleton(()=>({" +
				files
					.map((file) =>
						file.definitions
							.map((definition) => {
								return `${definition.alias}:${
									definition.singleton ? "singleton(" : ""
								}()=>value_${definition.alias}(${
									definition.local && definition.local.length
										? `mergeLazy(()=>unproxy(local.${definition.alias}),()=>container)`
										: "container"
								})${definition.singleton ? ")" : ""},`;
							})
							.join("")
					)
					.join("") +
				"})),()=>global)));";
			const functionEnd = "return container;}";
			return format(
				imports +
					utilities +
					containerType +
					autoDependenciesType +
					allDependenciesType +
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

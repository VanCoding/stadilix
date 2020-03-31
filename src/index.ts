import { format } from "prettier";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import glob from "glob";

interface Source {
	path: string;
	definitions: Definition[];
}
interface Definition {
	name: string;
	alias: string;
	local?: string[];
}

const utilities = readFileSync(__dirname + "/utilities.ts") + "";

function getDefaultModule(filePath: string) {
	const fileNameWithoutExtension = path.basename(filePath).split(".")[0];
	return {
		name:
			"make" +
			fileNameWithoutExtension[0].toUpperCase() +
			fileNameWithoutExtension.substr(1),
		alias:
			fileNameWithoutExtension[0].toLocaleLowerCase() +
			fileNameWithoutExtension.substr(1),
	};
}

function populatePathList(basepath: string, paths: string[]) {
	const allPaths: string[] = [];
	paths.map((path) => {
		if (path[0] != "/" && path[0] != ".") path = "./" + path;
		glob
			.sync(path, { cwd: basepath, nodir: true })
			.forEach((p) => allPaths.push(p));
	});
	return allPaths;
}

function listExceptList(paths: string[], except: string[]) {
	return paths.filter((path) => !except.includes(path));
}

export function createBuilder(basepath: string) {
	const files: Source[] = [];
	const builder = {
		register: (path: string, definitions: Definition[]) => {
			files.push({ path: path.replace(".ts", ""), definitions });
		},
		registerAll: ({
			paths,
			except,
			modules = (filePath: string) => [getDefaultModule(filePath)],
		}: {
			paths: string[];
			except: string[];
			modules?: (filePath?: string) => { name: string; alias: string }[];
		}) => {
			const allPaths = listExceptList(
				populatePathList(basepath, paths),
				populatePathList(basepath, except)
			);
			for (const path of allPaths) {
				builder.register(path, modules(path));
			}
		},
		registerManuals: (modules: string[], manuals: string[]) => {
			for (const file of files) {
				for (const module of file.definitions) {
					if (modules.includes(module.alias)) module.local = manuals;
				}
			}
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
			const functionDefinition = `export default function(build: (container: Container)=>{global: FunctionProxy<ManualGlobalDependencies>, local: DeepFunctionProxy<ManualLocalDependencies>,nonSingletons?: Array<keyof Container>}){`;

			const container =
				"let container: Container;const {global,local,nonSingletons} = build(container=unproxy(mergeLazy(singleton(()=>({" +
				files
					.map((file) =>
						file.definitions
							.map((definition) => {
								return `${definition.alias}:
								conditionalSingleton(!nonSingletons.includes("${definition.alias}"),()=>value_${
									definition.alias
								}(${
									definition.local && definition.local.length
										? `mergeLazy(()=>unproxy(local.${definition.alias}),()=>container)`
										: "container"
								})),`;
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
		buildToFile: (path: string) => {
			writeFileSync(path, builder.build());
		},
	};
	return builder;
}

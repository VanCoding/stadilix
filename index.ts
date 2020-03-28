console.log("helloo");

interface Repository {}

function makeService({
	repository,
	port
}: {
	repository: Repository;
	port: number;
}) {
	return {};
}

type FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any
	? U
	: any;
type AllDependencies = FirstArgument<typeof makeService>;
type ManualDependencies = Pick<AllDependencies, "port">;

const x: ManualDependencies = {
	port: 1
};

console.log(x);

setInterval(() => {}, 1000);

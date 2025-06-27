import { CommandsRegistry, handlerLogin, registerCommand, runCommand } from "./commands";

function main() {
    const registry: CommandsRegistry = {};
    registerCommand(registry, "login", handlerLogin);

    const argv = process.argv.slice(2);

    if (argv.length == 0) {
        console.log("Not enough arguments");
        process.exit(1);
    }

    const [cmdName, ...args] = argv;

    try {
        runCommand(registry, cmdName, ...args);
    } catch (err) {
        let message = err instanceof Error ? err.message : String(err);

        console.log(`Error running command "${cmdName}": ${message}`);
        process.exit(1);
    }
}

main();
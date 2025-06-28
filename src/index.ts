import { CommandsRegistry, handlerAgg, handlerLogin, handlerRegister, handlerReset, handlerUsers, registerCommand, runCommand } from "./commands";

async function main() {
    const registry: CommandsRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerUsers);
    registerCommand(registry, "agg", handlerAgg);

    const argv = process.argv.slice(2);

    if (argv.length == 0) {
        console.log("Not enough arguments");
        process.exit(1);
    }

    const [cmdName, ...args] = argv;

    try {
        await runCommand(registry, cmdName, ...args);
    } catch (err) {
        let message = err instanceof Error ? err.message : String(err);

        console.log(`Error running command "${cmdName}": ${message}`);
        process.exit(1);
    }

    process.exit(0)
}

main();
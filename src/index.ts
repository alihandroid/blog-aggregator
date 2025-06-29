import { CommandsRegistry, handlerAddFeed, handlerAgg, handlerBrowse, handlerFeeds, handlerFollow, handlerFollowing, handlerLogin, handlerRegister, handlerReset, handlerUnfollow, handlerUsers, middlewareLoggedIn, registerCommand, runCommand } from "./commands";

async function main() {
    const registry: CommandsRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
    registerCommand(registry, "feeds", handlerFeeds);
    registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
    registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
    registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
    registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));

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
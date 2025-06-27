import { setUser } from "./config";

type CommandHandler = (cmdName: string, ...args: string[]) => void;
export type CommandsRegistry = Record<string, CommandHandler>;

export function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("login expects a single argument, the username");
    }

    const username = args[0];

    setUser(username);

    console.log(`User has been set to ${username}`)
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (handler === undefined) {
        throw new Error(`The command ${cmdName} is not registered`);
    }

    handler(cmdName, ...args);
}
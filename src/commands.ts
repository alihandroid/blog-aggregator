import { readConfig, setUser } from "./config";
import { createUser, deleteAllUsers, getUserByName, getUsers } from "./lib/db/queries/users";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("login expects a single argument, the username");
    }

    const username = args[0];

    if (await getUserByName(username) === undefined) {
        throw new Error(`User ${username} does not exist`);
    }

    setUser(username);

    console.log(`User has been set to ${username}`)
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("register expects a single argument, the username");
    }

    const username = args[0];

    if (await getUserByName(username) !== undefined) {
        throw new Error(`User ${username} already exists`);
    }

    const user = await createUser(username);

    setUser(username);
    console.log(`Created user ${username}`);
    console.log(user);
}

export async function handlerReset() {
    await deleteAllUsers();
    console.log("Successfully deleted all users");
}

export async function handlerUsers() {
    const users = await getUsers();
    const currentUser = readConfig().currentUserName;
    for (const user of users) {
        console.log(`* ${user.name}${user.name === currentUser ? " (current)" : ""}`);
    }
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (handler === undefined) {
        throw new Error(`The command ${cmdName} is not registered`);
    }

    await handler(cmdName, ...args);
}
import { readConfig, setUser } from "./config";
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feedFollows";
import { createFeed, Feed, getFeedByURL, getFeedsWithUsers } from "./lib/db/queries/feeds";
import { createUser, deleteAllUsers, getUserByName, getUsers, User } from "./lib/db/queries/users";
import { fetchFeed } from "./lib/rss";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

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

export async function handlerAgg() {
    const result = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(result, null, 2));
}

function printFeed(feed: Feed, user: User) {
    console.log(`- ID:         ${feed.id}`);
    console.log(`- Created At: ${feed.createdAt}`);
    console.log(`- Updated At: ${feed.updatedAt}`);
    console.log(`- Name:       ${feed.name}`);
    console.log(`- URL:        ${feed.url}`);
    console.log(`- User:       ${user.name}`);
}

export async function handlerAddFeed(cmdName: string, user: User, name: string, url: string) {
    if (!name) {
        throw new Error("name argument must be present");
    }

    if (!url) {
        throw new Error("url argument must be present");
    }

    const feed = await createFeed(name, url, user.id);
    await createFeedFollow(user.id, feed.id);
    printFeed(feed, user);
}

export async function handlerFeeds() {
    const feeds = await getFeedsWithUsers();
    for (const feed of feeds) {
        printFeed(feed, feed.user);
        console.log("-".repeat(70));
    }
}

export async function handlerFollow(cmdName: string, user: User, url: string) {
    const feed = await getFeedByURL(url);

    if (!feed) {
        throw new Error(`Feed with URL ${url} does not exist`);
    }

    await createFeedFollow(user.id, feed.id);
    printFeed(feed, user);
}

export async function handlerFollowing(cmdName: string, user: User) {
    const followedFeeds = await getFeedFollowsForUser(user.id);

    for (const followedFeed of followedFeeds) {
        console.log(`- ${followedFeed.feed.name}`);
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

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName, ...args) => {
        const currentUser = readConfig().currentUserName;
        const user = await getUserByName(currentUser);

        if (!user) {
            throw new Error(`User ${currentUser} does not exist`);
        }

        await handler(cmdName, user, ...args);
    };
}
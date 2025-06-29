import { readConfig, setUser } from "./config";
import { createFeedFollow, deleteFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feedFollows";
import { createFeed, Feed, getFeedByURL, getFeedsWithUsers } from "./lib/db/queries/feeds";
import { createUser, deleteAllUsers, getUserByName, getUsers, User } from "./lib/db/queries/users";
import { fetchFeed, scrapeFeeds } from "./lib/rss";

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

function parseDuration(durationStr: string) {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);

    if (!match) {
        throw new Error("Malformed duration string");
    }

    let duration = parseInt(match[1])
    const suffix = match[2];

    switch (suffix) {
        case "ms":
            break;
        case "s":
            duration *= 1000;
            break;
        case "m":
            duration *= 1000 * 60;
            break;
        case "h":
            duration *= 1000 * 60 * 60;
            break;
        default:
            throw new Error("Unsupported time format");
    }

    return duration;
}

export async function handlerAgg(cmdName: string, timeBetweenReqs: string) {
    function handleError(reason: any) {
        console.log(reason);
        process.exit(1);
    }

    const requestIntervalMillis = parseDuration(timeBetweenReqs);
    scrapeFeeds().catch(handleError);

    console.log(`Collecting feeds every ${timeBetweenReqs}`)

    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, requestIntervalMillis);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
}

function printFeed(feed: Feed, user: User) {
    console.log(`- ID:         ${feed.id}`);
    console.log(`- Created At: ${feed.createdAt}`);
    console.log(`- Updated At: ${feed.updatedAt}`);
    console.log(`- Name:       ${feed.name}`);
    console.log(`- URL:        ${feed.url}`);
    console.log(`- User:       ${user.name}`);
    console.log(`- Last Fetched At: ${feed.last_fetched_at}`);
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

export async function handlerUnfollow(cmdName: string, user: User, url: string) {
    const feed = await getFeedByURL(url);

    if (!feed) {
        throw new Error(`Feed with URL ${url} does not exist`);
    }

    await deleteFeedFollow(user.id, feed.id);
    console.log(`${user.name} stopped following ${url}`);
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
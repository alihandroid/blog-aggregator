import { db } from "..";
import { feeds, users } from "../schema";

export type Feed = typeof feeds.$inferSelect;

export async function createFeed(name: string, url: string, user_id: string) {
    const [result] = await db.insert(feeds).values({ name, url, user_id }).returning();
    return result;
}

export async function getFeedsWithUsers() {
    const result = await db.query.feeds.findMany({ with: { user: true } });
    return result;
}
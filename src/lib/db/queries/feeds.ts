import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds } from "../schema";

export type Feed = typeof feeds.$inferSelect;

export async function createFeed(name: string, url: string, user_id: string) {
    const [result] = await db.insert(feeds).values({ name, url, user_id }).returning();
    return result;
}

export async function getFeedsWithUsers() {
    const result = await db.query.feeds.findMany({ with: { user: true } });
    return result;
}

export async function getFeedByURL(url: string) {
    const result = await db.query.feeds.findFirst({ where: eq(feeds.url, url) });
    return result;
}
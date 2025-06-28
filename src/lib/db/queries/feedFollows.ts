import { and, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows } from "../schema";

export async function createFeedFollow(user_id: string, feed_id: string) {
    await db.insert(feedFollows).values({ user_id, feed_id });
    const result = await db.query.feedFollows.findFirst({ where: and(eq(feedFollows.user_id, user_id), eq(feedFollows.feed_id, feed_id)), with: { feed: true, user: true } });
    return result;
}

export async function getFeedFollowsForUser(user_id: string) {
    const result = await db.query.feedFollows.findMany({ where: eq(feedFollows.user_id, user_id), with: { feed: true } });
    return result;
}

export async function deleteFeedFollow(user_id: string, feed_id: string) {
    await db.delete(feedFollows).where(and(eq(feedFollows.user_id, user_id), eq(feedFollows.feed_id, feed_id)));
}
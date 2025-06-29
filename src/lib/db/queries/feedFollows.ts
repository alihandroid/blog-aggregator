import { and, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows } from "../schema";

export async function createFeedFollow(userId: string, feedId: string) {
    await db.insert(feedFollows).values({ userId, feedId });
    const result = await db.query.feedFollows.findFirst({ where: and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)), with: { feed: true, user: true } });
    return result;
}

export async function getFeedFollowsForUser(userId: string) {
    const result = await db.query.feedFollows.findMany({ where: eq(feedFollows.userId, userId), with: { feed: true } });
    return result;
}

export async function deleteFeedFollow(userId: string, feedId: string) {
    await db.delete(feedFollows).where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)));
}
import { desc, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, posts, users } from "../schema";

export type Post = typeof posts.$inferSelect;

export async function createPost(title: string, url: string, description: string, publishedAt: Date, feedId: string) {
    const [result] = await db.insert(posts).values({ title, url, description, publishedAt, feedId }).returning();
    return result;
}

export async function getPostsForUser(userId: string, limit: number) {
    const result = await db.select({ posts }).from(posts)
        .innerJoin(feeds, eq(feeds.id, posts.feedId))
        .innerJoin(feedFollows, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(users.id, feedFollows.userId))
        .where(eq(users.id, userId))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);
    return result.map(x => x.posts);
}
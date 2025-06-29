import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull(),
    url: text("url").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    lastFetchedAt: timestamp("last_fetched_at"),
});

export const feedsRelations = relations(feeds, ({ one }) => ({
    user: one(users, {
        fields: [feeds.userId],
        references: [users.id]
    }),
}));

export const feedFollows = pgTable("feed_follows", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    feedId: uuid("feed_id").references(() => feeds.id, { onDelete: "cascade" }).notNull()
}, (t) => [
    unique().on(t.userId, t.feedId)
]);

export const feedFollowsRelations = relations(feedFollows, ({ one }) => ({
    feed: one(feeds, {
        fields: [feedFollows.feedId],
        references: [feeds.id]
    }),
    user: one(users, {
        fields: [feedFollows.userId],
        references: [users.id]
    }),
}));

export const posts = pgTable("posts", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    title: text("title").notNull(),
    url: text("url").notNull().unique(),
    description: text("description").notNull(),
    publishedAt: timestamp("published_at"),
    feedId: uuid("feed_id").references(() => feeds.id, { onDelete: "cascade" }).notNull()
});

export const postsRelations = relations(posts, ({ one }) => ({
    feed: one(feeds, {
        fields: [posts.feedId],
        references: [feeds.id],
    })
}));
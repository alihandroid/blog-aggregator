import { XMLParser } from "fast-xml-parser";
import { getNextFeedToFetch, markFeedFetched } from "./db/queries/feeds";
import { createPost } from "./db/queries/posts";

export type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

export type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};

export async function fetchFeed(feedURL: string) {
    const response = await fetch(feedURL, {
        method: "GET",
        headers: {
            "User-Agent": "gator",
        },
    });
    const data = await response.text();

    const parser = new XMLParser();
    const obj = parser.parse(data);

    if (!obj.rss) {
        throw new Error("The result is not an RSS feed");
    }

    const rss = obj.rss;

    if (!rss.channel) {
        throw new Error("The RSS feed is missing the channel field");
    }
    if (!rss.channel.title) {
        throw new Error("The RSS feed is missing the channel.title field");
    }
    if (!rss.channel.link) {
        throw new Error("The RSS feed is missing the channel.link field");
    }
    if (!rss.channel.description) {
        throw new Error("The RSS feed is missing the channel.description field");
    }
    if (!Array.isArray(rss.channel.item)) {
        rss.channel.item = [];
    }

    const result: RSSFeed = {
        channel: {
            title: rss.channel.title,
            link: rss.channel.link,
            description: rss.channel.description,
            item: []
        }
    };

    for (const it of rss.channel.item) {
        if (!it.title || !it.link || !it.description || !it.pubDate) {
            continue;
        }
        result.channel.item.push({
            title: it.title,
            link: it.link,
            description: it.description,
            pubDate: it.pubDate,
        });
    }

    return result;
}

export async function scrapeFeeds() {
    const nextFeed = await getNextFeedToFetch();
    if (!nextFeed) {
        throw new Error("Cannot find a feed to fetch");
    }

    await markFeedFetched(nextFeed.id);

    const rss = await fetchFeed(nextFeed.url);

    for (const item of rss.channel.item) {
        console.log(item.pubDate);
        const publishedAt = new Date(item.pubDate);
        console.log(publishedAt);
        await createPost(item.title, item.link, item.description, publishedAt, nextFeed.id);
    }
}
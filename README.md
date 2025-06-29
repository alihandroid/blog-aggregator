# gator

A blog aggregator built with TypeScript and Node.

## Installation

Clone the repo. Run `npm i` to install dependencies.

`npm run migrate` to create the PostgreSQL database (requires `psql`)

## Usage

Prefix the commands with `npm run start`

### login

Login as a user.

```
npm run start login alihandroid
```

### register

Register a new user.

```
npm run start register alihandroid
```

### reset

Remove all users.

```
npm run start reset
```

### users

List all users.


```
npm run start users
```

### agg

Aggregate blogs. Takes time between requests as a parameter. Ctrl + C to exit.


```
npm run start agg 1m
```

### addfeed

Add a new feed. The user who adds the feed automatically follows it.

```
npm run addfeed Title https://example.com/rss
```

### feeds

List all feeds.

```
npm run start feeds
```

### follow

Follow a feed.

```
npm run start follow https://example.com/rss
```

### following

List all the feeds the user follows.

```
npm run start following
```

### unfollow

Unfollow a feed.

```
npm run start unfollow https://example.com/rss
```

### browse

Browse the latest posts from your feeds.

```
npm run start browse
```
# Atomic Reader Twitch Rss

## Configure

Head over to https://dev.twitch.tv and register an application.

* Name: `Atomic-Reader-Rss`
* OAuth Redirect URLs: `http://localhost`
* Category: `Application Integration`

Create a `twitch.env` file with the following contents:

```
TWITCH_CLIENT_ID=<twitch_client_id>
TWITCH_CLIENT_SECRET=<twitch_client_secret>
```

## Build and Deploy

Execute `.\Build.cmd` (requires Docker).

Feeds are available at: `http://localhost:30001/api/v1/:twitchUserName`.

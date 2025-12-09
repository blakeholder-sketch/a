# F1 Discord Bot

Formula 1 themed Discord bot with commands for race info, schedule, driver and team standings, driver cards, and a lightweight economy view.

Quick start

1. Copy `.env.example` -> `.env` and fill `DISCORD_TOKEN` and `CLIENT_ID` (and `DEV_GUILD_ID` if using a dev guild).
2. Install dependencies:

```powershell
cd c:\Users\blake.holder\Documents\blake
npm install
```

3. Start the bot:

```powershell
npm start
```

Notes

- The bot uses the public Ergast API for F1 data: `http://ergast.com/api/f1`.
- Requires Node.js 18+ (uses global fetch). If you run an older Node, consider upgrading.

Commands

- `/schedule` - Show the current season schedule or next race.
- `/race` - Show next race details.
- `/driver-standings` - Current WDC standings.
- `/team-standings` - Current constructors standings.
- `/teams` - List teams/constructors.
- `/driver-card <driverIdOrName>` - Show a driver card with stats (generates PNG with avatar and market value).
- `/economy` - Lightweight economy view (mock budgets based on points).
- `/results` - Show most recent race results.
- `/qualifying` - Show most recent qualifying results.
- `/compare-drivers <driver1> <driver2>` - Compare two drivers by current season points.
- `/favorite set|get|clear` - Save and retrieve your favorite driver (stored in DB).
- `/subscribe channel|unsubscribe|dm|dm-unsubscribe|list` - Manage race reminder subscriptions for channels or DMs.
- `/reminder-test [target: channel|dm]` - Send test reminders immediately (for debugging).

DM subscriptions

- Users can subscribe to receive race reminders via DM using `/subscribe dm`. Use `/subscribe dm-unsubscribe` to opt out.
- Reminders are sent 24 hours and 1 hour before each race, tracked by DB to avoid duplicates.

Driver cards

- `/driver-card` generates a PNG driver card image with an initials avatar (colored by a hash of the driver's name), name, code, nationality, DOB, and mocked market value derived from season points.
- When a driver name matches multiple drivers, a select menu is presented for disambiguation. After selection, the full card is generated.

Channel subscriptions

- Guilds can subscribe a channel using `/subscribe channel` to receive reminders in that channel.
- Use `/subscribe unsubscribe` to remove the subscription, or `/subscribe list` to see all subscriptions in the guild.

Testing reminders

- Use `/reminder-test target: channel` to immediately send test reminders to the current channel.
- Use `/reminder-test target: dm` to immediately send test reminders to your DMs.
- This is useful for verifying the scheduler works and that the bot can reach your DMs.

Scheduler and Database

- The bot uses a lightweight SQLite DB located at `data/f1bot.sqlite` to store favorites, subscriptions, and sent reminders.
- A background scheduler runs every 10 minutes and sends 24-hour and 1-hour race reminders to subscribed channels.

Install notes

- Some dependencies like `canvas` require system build tools. On Windows you may need to install `windows-build-tools` or follow Canvas installation instructions: https://www.npmjs.com/package/canvas
- After editing `package.json` or pulling the repo, run:

```powershell
npm install
```

Testing

- Run unit tests with:

```powershell
npm test
```

- Tests are written with Jest and cover format utilities. CI automatically runs tests on push to main/develop and on pull requests.
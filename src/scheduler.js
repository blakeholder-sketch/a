const cron = require('node-cron');
const api = require('./utils/api');
const db = require('./db');

function toISOKey(race) {
  // race contains season + round
  return `${race.season}-${race.round}`;
}

async function sendReminderToChannel(client, channelId, content) {
  try {
    const ch = await client.channels.fetch(channelId).catch(() => null);
    if (!ch) return false;
    await ch.send(content);
    return true;
  } catch (e) {
    console.error('Failed to send reminder', e);
    return false;
  }
}

async function sendReminderToUser(client, userId, content) {
  try {
    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) return false;
    await user.send(content).catch(() => null);
    return true;
  } catch (e) {
    console.error('Failed to send DM reminder', e);
    return false;
  }
}

function startScheduler(client) {
  // run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      const next = await api.getNextRace();
      const race = next.RaceTable.Races?.[0];
      if (!race) return;
      const dateStr = race.date + (race.time ? 'T' + race.time : 'T00:00:00Z');
      const raceDate = new Date(dateStr);
      const now = new Date();
      const diffMs = raceDate - now;
      const diffHours = diffMs / (1000 * 60 * 60);
      const raceId = toISOKey(race);

      const subs = await db.listSubscriptions();
      // For each subscription, check and send 24h and 1h reminders within a small window
      for (const s of subs) {
        // channel subscriptions
        if (s.channelId) {
          // 24h reminder
          if (diffHours <= 24 && diffHours > 23.8) {
            const sent = await db.hasSentReminder(raceId, '24h', s.channelId);
            if (!sent) {
              const content = `:checkered_flag: Reminder — **${race.raceName}** is in ~24 hours (${raceDate.toUTCString()}).`;
              const ok = await sendReminderToChannel(client, s.channelId, content);
              if (ok) await db.recordSentReminder(raceId, '24h', s.channelId);
            }
          }
          // 1h reminder
          if (diffHours <= 1 && diffHours > 0.8) {
            const sent = await db.hasSentReminder(raceId, '1h', s.channelId);
            if (!sent) {
              const content = `:rocket: Final reminder — **${race.raceName}** starts in about 1 hour (${raceDate.toUTCString()}).`;
              const ok = await sendReminderToChannel(client, s.channelId, content);
              if (ok) await db.recordSentReminder(raceId, '1h', s.channelId);
            }
          }
        }
        // user DM subscriptions
        if (s.userId) {
          const dmKey = `dm:${s.userId}`;
          if (diffHours <= 24 && diffHours > 23.8) {
            const sent = await db.hasSentReminder(raceId, '24h', dmKey);
            if (!sent) {
              const content = `:checkered_flag: Reminder — **${race.raceName}** is in ~24 hours (${raceDate.toUTCString()}).`;
              const ok = await sendReminderToUser(client, s.userId, content);
              if (ok) await db.recordSentReminder(raceId, '24h', dmKey);
            }
          }
          if (diffHours <= 1 && diffHours > 0.8) {
            const sent = await db.hasSentReminder(raceId, '1h', dmKey);
            if (!sent) {
              const content = `:rocket: Final reminder — **${race.raceName}** starts in about 1 hour (${raceDate.toUTCString()}).`;
              const ok = await sendReminderToUser(client, s.userId, content);
              if (ok) await db.recordSentReminder(raceId, '1h', dmKey);
            }
          }
        }
      }
    } catch (e) {
      console.error('Scheduler error', e);
    }
  });
}

async function sendImmediateReminders(client, { channelId = null, userId = null } = {}) {
  try {
    const next = await api.getNextRace();
    const race = next.RaceTable.Races?.[0];
    if (!race) return;
    const dateStr = race.date + (race.time ? 'T' + race.time : 'T00:00:00Z');
    const raceDate = new Date(dateStr);
    const raceId = toISOKey(race);

    // send a test 24h and 1h message immediately
    if (channelId) {
      const content24 = `:checkered_flag: [TEST] Reminder — **${race.raceName}** is scheduled at ${raceDate.toUTCString()}. (24h test)`;
      await sendReminderToChannel(client, channelId, content24);
      const content1 = `:rocket: [TEST] Final reminder — **${race.raceName}** starts at ${raceDate.toUTCString()}. (1h test)`;
      await sendReminderToChannel(client, channelId, content1);
      return true;
    }
    if (userId) {
      const content24 = `:checkered_flag: [TEST] Reminder — **${race.raceName}** is scheduled at ${raceDate.toUTCString()}. (24h test)`;
      await sendReminderToUser(client, userId, content24);
      const content1 = `:rocket: [TEST] Final reminder — **${race.raceName}** starts at ${raceDate.toUTCString()}. (1h test)`;
      await sendReminderToUser(client, userId, content1);
      return true;
    }

    // otherwise send to all subscriptions (not recommended for tests)
    const subs = await db.listSubscriptions();
    for (const s of subs) {
      if (s.channelId) {
        await sendReminderToChannel(client, s.channelId, `:checkered_flag: [TEST] ${race.raceName} at ${raceDate.toUTCString()}`);
      }
      if (s.userId) {
        await sendReminderToUser(client, s.userId, `:checkered_flag: [TEST] ${race.raceName} at ${raceDate.toUTCString()}`);
      }
    }
    return true;
  } catch (e) {
    console.error('sendImmediateReminders error', e);
    return false;
  }
}

module.exports = { startScheduler, sendImmediateReminders };

const path = require('node:path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DB_PATH = path.join(__dirname, '..', 'data', 'f1bot.sqlite');

let dbPromise = null;

async function init() {
  if (dbPromise) return dbPromise;
  dbPromise = open({
    filename: DB_PATH,
    driver: sqlite3.Database
  }).then(async (db) => {
    await db.exec(`CREATE TABLE IF NOT EXISTS favorites (
      userId TEXT PRIMARY KEY,
      driverId TEXT,
      name TEXT
    );`);
    await db.exec(`CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guildId TEXT,
      channelId TEXT,
      userId TEXT,
      type TEXT
    );`);
    await db.exec(`CREATE TABLE IF NOT EXISTS sent_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raceId TEXT,
      reminderType TEXT,
      channelId TEXT,
      UNIQUE(raceId, reminderType, channelId)
    );`);
    return db;
  });
  return dbPromise;
}

async function setFavorite(userId, driverId, name) {
  const db = await init();
  await db.run(`INSERT INTO favorites(userId, driverId, name) VALUES(?,?,?)
    ON CONFLICT(userId) DO UPDATE SET driverId=excluded.driverId, name=excluded.name;`, userId, driverId, name);
}

async function getFavorite(userId) {
  const db = await init();
  return db.get(`SELECT driverId, name FROM favorites WHERE userId = ?`, userId);
}

async function clearFavorite(userId) {
  const db = await init();
  await db.run(`DELETE FROM favorites WHERE userId = ?`, userId);
}

async function addSubscription({ guildId = null, channelId = null, userId = null, type = 'race' } = {}) {
  const db = await init();
  await db.run(`INSERT INTO subscriptions(guildId, channelId, userId, type) VALUES(?,?,?,?)`, guildId, channelId, userId, type);
}

async function removeSubscription({ guildId = null, channelId = null, userId = null, type = 'race' } = {}) {
  const db = await init();
  const res = await db.run(`DELETE FROM subscriptions WHERE guildId IS ? AND channelId IS ? AND userId IS ? AND type = ?`, guildId, channelId, userId, type);
  return res.changes;
}

async function listSubscriptions(guildId = null) {
  const db = await init();
  if (guildId) return db.all(`SELECT * FROM subscriptions WHERE guildId = ?`, guildId);
  return db.all(`SELECT * FROM subscriptions`);
}

async function recordSentReminder(raceId, reminderType, channelId) {
  const db = await init();
  try {
    await db.run(`INSERT INTO sent_reminders(raceId, reminderType, channelId) VALUES(?,?,?)`, raceId, reminderType, channelId);
    return true;
  } catch (e) {
    return false;
  }
}

async function hasSentReminder(raceId, reminderType, channelId) {
  const db = await init();
  const row = await db.get(`SELECT id FROM sent_reminders WHERE raceId = ? AND reminderType = ? AND channelId = ?`, raceId, reminderType, channelId);
  return !!row;
}

module.exports = {
  init,
  setFavorite,
  getFavorite,
  clearFavorite,
  addSubscription,
  removeSubscription,
  listSubscriptions,
  recordSentReminder,
  hasSentReminder,
};

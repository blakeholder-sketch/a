const db = require('../db');

async function readFavorites() {
  // returns object mapping userId -> { driverId, name }
  const rows = await db.listSubscriptions();
  // Not used; keep legacy API shape by reading favorites via db.getFavorite per user would be expensive.
  // We'll provide readFavorites to support existing callers by returning an object of current favorites.
  const favs = {};
  // Use sqlite directly to pull all favorites
  const sqlDb = await db.init();
  const all = await sqlDb.all(`SELECT userId, driverId, name FROM favorites`);
  for (const r of all) favs[r.userId] = { driverId: r.driverId, name: r.name };
  return favs;
}

async function writeFavorites(obj) {
  // Accepts object mapping userId -> {driverId, name}
  const sqlDb = await db.init();
  const tx = await sqlDb.exec('BEGIN');
  try {
    const stmt = await sqlDb.prepare(`INSERT INTO favorites(userId, driverId, name) VALUES(?,?,?)
      ON CONFLICT(userId) DO UPDATE SET driverId=excluded.driverId, name=excluded.name;`);
    for (const [userId, val] of Object.entries(obj || {})) {
      await stmt.run(userId, val.driverId, val.name);
    }
    await stmt.finalize();
    await sqlDb.exec('COMMIT');
  } catch (e) {
    await sqlDb.exec('ROLLBACK');
    throw e;
  }
}

module.exports = { readFavorites, writeFavorites };

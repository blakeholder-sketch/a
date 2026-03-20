const BASE = 'https://ergast.com/api/f1';

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const txt = await res.text();
  // Ergast sometimes returns text/plain; parse safely
  return JSON.parse(txt);
}

async function getCurrentSeasonSchedule() {
  const data = await fetchJson(`${BASE}/current.json`);
  return data.MRData;
}

async function getNextRace() {
  const data = await fetchJson(`${BASE}/current/next.json`);
  return data.MRData;
}

async function getDriverStandings() {
  const data = await fetchJson(`${BASE}/current/driverStandings.json`);
  return data.MRData;
}

async function getConstructorStandings() {
  const data = await fetchJson(`${BASE}/current/constructorStandings.json`);
  return data.MRData;
}

async function getConstructors() {
  const data = await fetchJson(`${BASE}/current/constructors.json`);
  return data.MRData;
}

async function getDriverById(id) {
  const data = await fetchJson(`${BASE}/drivers/${encodeURIComponent(id)}.json`);
  return data.MRData;
}

async function searchDriversByName(name) {
  // Ergast doesn't have a search endpoint; we list all drivers and filter
  const data = await fetchJson(`${BASE}/current/drivers.json`);
  const list = data.MRData.DriverTable.Drivers || [];
  return list.filter(d => (`${d.givenName} ${d.familyName}`.toLowerCase().includes(name.toLowerCase()) || d.familyName.toLowerCase().includes(name.toLowerCase())));
}

async function getLastRaceResults() {
  const data = await fetchJson(`${BASE}/current/last/results.json`);
  return data.MRData;
}

async function getLastQualifyingResults() {
  const data = await fetchJson(`${BASE}/current/last/qualifying.json`);
  return data.MRData;
}

module.exports = {
  getCurrentSeasonSchedule,
  getNextRace,
  getDriverStandings,
  getConstructorStandings,
  getConstructors,
  getDriverById,
  searchDriversByName,
  getLastRaceResults,
  getLastQualifyingResults,
};

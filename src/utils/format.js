function formatDateTime(utcDateStr) {
  // Ergast provides date and time separate; sometimes only date is present.
  try {
    const d = new Date(utcDateStr);
    if (isNaN(d)) return utcDateStr;
    return d.toUTCString();
  } catch (e) {
    return utcDateStr;
  }
}

function shortAmount(n) {
  if (n >= 1e9) return (n/1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'k';
  return String(n);
}

module.exports = { formatDateTime, shortAmount };

const { createCanvas, registerFont } = require('canvas');

// Optionally register a font if available on the system
// registerFont('/path/to/font.ttf', { family: 'Inter' });

function px(n) { return Math.round(n); }

async function renderDriverCard({ name = '', code = '', nationality = '', dateOfBirth = '', market = '' } = {}) {
  const width = 800;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0b0d0f';
  ctx.fillRect(0, 0, width, height);

  // Accent bar
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, width, 24);

  // Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Sans';
  ctx.fillText(name, 40, 90);

  // initials avatar
  const initials = name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();
  const avatarX = width - 300;
  const avatarY = 60;
  const avatarSize = 120;
  // pick color from name
  const accent = pickColorFromString(name || code || nationality);
  ctx.fillStyle = accent;
  roundRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 14, true, false);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px Sans';
  ctx.fillText(initials, avatarX + 20, avatarY + 72);

  // Code badge
  ctx.fillStyle = '#1f1f1f';
  ctx.fillRect(width - 200, 40, 140, 56);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Sans';
  ctx.fillText(code || '', width - 200 + 20, 80);

  // Meta
  ctx.fillStyle = '#bdbdbd';
  ctx.font = '20px Sans';
  ctx.fillText(`Nationality: ${nationality || '—'}`, 40, 140);
  ctx.fillText(`DOB: ${dateOfBirth || '—'}`, 40, 170);

  // Market / economy
  ctx.fillStyle = '#fff59d';
  ctx.font = '22px Sans';
  ctx.fillText(`Market value: ${market || '—'}`, 40, 220);

  // helper: small rounded rect
  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof stroke === 'undefined') stroke = true;
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function pickColorFromString(s) {
    if (!s) return '#37474f';
    let h = 0;
    for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
    const hue = Math.abs(h) % 360;
    return `hsl(${hue} 70% 40%)`;
  }

  // Small footer
  ctx.fillStyle = '#9e9e9e';
  ctx.font = '14px Sans';
  ctx.fillText('F1 Bot • driver card', 40, height - 20);

  return canvas.toBuffer('image/png');
}

module.exports = { renderDriverCard };

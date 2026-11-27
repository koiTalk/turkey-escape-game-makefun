// Gobble Dash — the in-run HUD, drawn on the canvas.
// One clear job: score, distance progress, hearts, corn, speed and the
// farmer-distance bar, all readable at a glance in a screenshot.

import { GOAL_DISTANCE, PALETTE, RUN, VIEW_H, VIEW_W } from './config.js';

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(-9, -3, -6, -11, 0, -5);
  ctx.bezierCurveTo(6, -11, 9, -3, 0, 5);
  ctx.closePath();
  ctx.fillStyle = filled ? '#ff5964' : 'rgba(255,255,255,0.25)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,10,10,0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export function drawHud(ctx, snap) {
  const { score, corn, hearts, speedKmh, farmerGap, distance, muted, dashReady } = snap;
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, VIEW_W, 64);
  ctx.fillStyle = PALETTE.hudAccent;
  ctx.fillRect(0, 64, VIEW_W, 4);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 26px Verdana, sans-serif';
  ctx.fillText(`SCORE ${score}`, 18, 24);
  ctx.font = 'bold 20px Verdana, sans-serif';
  ctx.fillText(`🌽 ${corn}`, 18, 50);

  // Distance progress bar to the forest gate.
  const barX = 300;
  const barW = 380;
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(barX, 14, barW, 18);
  ctx.fillStyle = '#7fb069';
  ctx.fillRect(barX, 14, barW * Math.min(1, distance / GOAL_DISTANCE), 18);
  ctx.strokeStyle = '#fff3d6';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, 14, barW, 18);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 19px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.floor(distance)} / ${GOAL_DISTANCE} m`, barX + barW / 2, 23);
  ctx.textAlign = 'left';
  ctx.font = '18px Verdana, sans-serif';
  ctx.fillText('🌲 Freedom Forest', barX, 50);

  // Hearts.
  for (let i = 0; i < 3; i++) {
    drawHeart(ctx, 730 + i * 34, 26, 26, i < hearts);
  }
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 18px Verdana, sans-serif';
  ctx.fillText('LIVES', 724, 52);

  // Speed + dash readiness.
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 20px Verdana, sans-serif';
  ctx.fillText(`${speedKmh} km/h`, 850, 24);
  ctx.font = '18px Verdana, sans-serif';
  ctx.fillStyle = dashReady ? '#8be04e' : 'rgba(255,233,184,0.55)';
  ctx.fillText(dashReady ? 'DASH ✓' : 'dash…', 850, 50);

  // Farmer distance bar: the closer the farmer, the redder the bar.
  const gapFrac = Math.max(0, Math.min(1, farmerGap / RUN.farmerMaxGap));
  const fx = 1010;
  const fw = 210;
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(fx, 14, fw, 18);
  ctx.fillStyle = gapFrac > 0.5 ? '#7fb069' : gapFrac > 0.25 ? '#ffb703' : '#ff5964';
  ctx.fillRect(fx, 14, fw * gapFrac, 18);
  ctx.strokeStyle = '#fff3d6';
  ctx.lineWidth = 2;
  ctx.strokeRect(fx, 14, fw, 18);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 18px Verdana, sans-serif';
  ctx.fillText('FARMER', fx, 50);
  if (muted) {
    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 18px Verdana, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('🔇 MUTED', VIEW_W - 14, 50);
    ctx.textAlign = 'left';
  }
}

export function drawHint(ctx, text) {
  ctx.font = '19px Verdana, sans-serif';
  const w = ctx.measureText(text).width + 36;
  ctx.fillStyle = 'rgba(40, 20, 8, 0.6)';
  ctx.fillRect((VIEW_W - w) / 2, VIEW_H - 40, w, 32);
  ctx.fillStyle = PALETTE.hudText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, VIEW_W / 2, VIEW_H - 24);
  ctx.textAlign = 'left';
}

// Gobble Dash — all canvas drawing: sky, farm, turkey, farmer,
// obstacles, corn and the title / end screens.
// One clear job: given a game snapshot, paint it. No state changes here
// except the button rects the input layer needs for clicks.

import { GOAL_DISTANCE, GROUND_Y, PALETTE, VIEW_H, VIEW_W } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawButton(ctx, x, y, w, h, label, accent) {
  ctx.fillStyle = accent ? '#ffb703' : '#fff3d6';
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,30,5,0.9)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#4a2408';
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  return { x, y, w, h };
}

function drawSky(ctx, scrollX, time) {
  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  g.addColorStop(0, PALETTE.skyTop);
  g.addColorStop(0.55, PALETTE.skyMid);
  g.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, GROUND_Y + 2);
  // Low autumn sun.
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.arc(1060, 130, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 243, 176, 0.35)';
  ctx.beginPath();
  ctx.arc(1060, 130, 78, 0, Math.PI * 2);
  ctx.fill();
  // Drifting clouds.
  ctx.fillStyle = 'rgba(255, 244, 214, 0.85)';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 360 - scrollX * 0.12 - time * 6) % 1500 + 1500) % 1500 - 120;
    const cy = 70 + i * 42;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 70, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 44, cy + 6, 52, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Distant hills.
  ctx.fillStyle = PALETTE.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW_W; x += 40) {
    const wx = x + scrollX * 0.25;
    ctx.lineTo(x, GROUND_Y - 90 - Math.sin(wx * 0.006) * 46 - Math.sin(wx * 0.013) * 18);
  }
  ctx.lineTo(VIEW_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  // Near hill + tree line.
  ctx.fillStyle = PALETTE.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW_W; x += 40) {
    const wx = x + scrollX * 0.5;
    ctx.lineTo(x, GROUND_Y - 34 - Math.sin(wx * 0.009 + 2) * 20);
  }
  ctx.lineTo(VIEW_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawGround(ctx, scrollX) {
  ctx.fillStyle = PALETTE.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = PALETTE.grass;
  ctx.fillRect(0, GROUND_Y, VIEW_W, 16);
  ctx.fillStyle = PALETTE.grassLight;
  for (let x = -((scrollX * 1) % 64); x < VIEW_W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + 8, GROUND_Y - 14);
    ctx.lineTo(x + 16, GROUND_Y);
    ctx.fill();
  }
  // Fence posts rattling past along the track.
  ctx.fillStyle = '#6b4423';
  for (let x = -((scrollX) % 180); x < VIEW_W; x += 180) {
    ctx.fillRect(x, GROUND_Y - 42, 10, 42);
    ctx.fillRect(x + 10, GROUND_Y - 34, 170, 6);
  }
}

function drawBarn(ctx, scrollX) {
  // One barn and one farmhouse pass by every ~1400 px of scroll.
  const period = 1500;
  const bx = VIEW_W - ((scrollX * 0.6) % period) + 80;
  if (bx > -320 && bx < VIEW_W + 40) {
    ctx.fillStyle = PALETTE.barnRed;
    ctx.fillRect(bx, GROUND_Y - 190, 220, 190);
    ctx.fillStyle = PALETTE.barnRoof;
    ctx.beginPath();
    ctx.moveTo(bx - 14, GROUND_Y - 188);
    ctx.lineTo(bx + 110, GROUND_Y - 268);
    ctx.lineTo(bx + 234, GROUND_Y - 188);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff3d6';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bx + 110, GROUND_Y - 190);
    ctx.lineTo(bx + 110, GROUND_Y - 90);
    ctx.moveTo(bx + 60, GROUND_Y - 140);
    ctx.lineTo(bx + 160, GROUND_Y - 140);
    ctx.stroke();
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BARN', bx + 110, GROUND_Y - 208);
  }
  const hx = bx + 700;
  if (hx > -260 && hx < VIEW_W + 40) {
    ctx.fillStyle = '#e9d8a6';
    ctx.fillRect(hx, GROUND_Y - 130, 180, 130);
    ctx.fillStyle = '#7f4f24';
    ctx.beginPath();
    ctx.moveTo(hx - 10, GROUND_Y - 128);
    ctx.lineTo(hx + 90, GROUND_Y - 190);
    ctx.lineTo(hx + 190, GROUND_Y - 128);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#33506e';
    ctx.fillRect(hx + 30, GROUND_Y - 100, 34, 34);
    ctx.fillRect(hx + 116, GROUND_Y - 100, 34, 34);
  }
}

export function drawTurkey(ctx, t, time) {
  const feetY = t.y + t.h;
  const ducking = t.ducking && t.onGround;
  const bob = t.onGround ? Math.sin(t.runCycle * 2) * 3 : 0;
  const blink = t.invulnerableT > 0 && Math.floor(time * 12) % 2 === 0;
  if (blink) ctx.globalAlpha = 0.45;
  ctx.save();
  ctx.translate(t.x + t.w / 2, feetY + bob);
  // Tail feather fan.
  ctx.fillStyle = PALETTE.turkeyFeather;
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate(i * 0.38 - 0.1);
    ctx.beginPath();
    ctx.ellipse(-34, -52, 11, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = i % 2 === 0 ? '#a4713a' : PALETTE.turkeyFeather;
    ctx.beginPath();
    ctx.ellipse(-34, -58, 6, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.turkeyFeather;
    ctx.restore();
  }
  // Body.
  ctx.fillStyle = PALETTE.turkeyBody;
  ctx.beginPath();
  ctx.ellipse(0, -42, 34, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.turkeyDark;
  ctx.beginPath();
  ctx.ellipse(0, -30, 26, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing.
  const wingFlap = t.onGround ? Math.sin(t.runCycle * 2) * 6 : -14;
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.ellipse(-4, -44 + wingFlap * 0.4, 22, 13, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Legs.
  ctx.strokeStyle = '#e9a319';
  ctx.lineWidth = 5;
  const legSwing = t.onGround ? Math.sin(t.runCycle * 2) * 12 : 8;
  ctx.beginPath();
  ctx.moveTo(-8, -14);
  ctx.lineTo(-8 + legSwing, 0);
  ctx.moveTo(10, -14);
  ctx.lineTo(10 - legSwing, 0);
  ctx.stroke();
  // Neck + head.
  const headY = ducking ? -58 : -78;
  const headX = 26;
  ctx.strokeStyle = PALETTE.turkeyHead;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(20, -62);
  ctx.quadraticCurveTo(30, headY + 16, headX, headY + 6);
  ctx.stroke();
  ctx.fillStyle = PALETTE.turkeyHead;
  ctx.beginPath();
  ctx.arc(headX, headY, 13, 0, Math.PI * 2);
  ctx.fill();
  // Beak + wattle + eye.
  ctx.fillStyle = PALETTE.beak;
  ctx.beginPath();
  ctx.moveTo(headX + 8, headY - 2);
  ctx.lineTo(headX + 26, headY + 3);
  ctx.lineTo(headX + 8, headY + 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.wattle;
  ctx.beginPath();
  ctx.ellipse(headX + 6, headY + 12, 4, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#201409';
  ctx.beginPath();
  ctx.arc(headX + 4, headY - 4, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
}

export function drawFarmer(ctx, gap, time) {
  // The farmer runs behind the turkey; closer gap = closer on screen.
  const fx = 230 - 60 - gap * 3.4;
  if (fx < -140) return;
  const feetY = GROUND_Y;
  const bob = Math.abs(Math.sin(time * 11)) * 5;
  ctx.save();
  ctx.translate(fx, feetY - bob);
  ctx.fillStyle = PALETTE.farmerShirt;
  ctx.beginPath();
  ctx.ellipse(0, -52, 26, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a5a8c';
  ctx.fillRect(-20, -38, 40, 26);
  ctx.strokeStyle = '#2c2c2c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(18, -70);
  ctx.lineTo(34, -108);
  ctx.moveTo(34, -108);
  ctx.lineTo(26, -96);
  ctx.moveTo(34, -108);
  ctx.lineTo(42, -96);
  ctx.stroke();
  ctx.fillStyle = '#e8b48a';
  ctx.beginPath();
  ctx.arc(0, -88, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.farmerHat;
  ctx.beginPath();
  ctx.ellipse(0, -96, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-13, -116, 26, 22);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('!', 0, -128);
  ctx.restore();
}

function drawObstacle(ctx, o, time) {
  if (o.kind === 'fence') {
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(o.x, o.y, 10, o.h);
    ctx.fillRect(o.x + o.w - 10, o.y, 10, o.h);
    ctx.fillRect(o.x, o.y + 8, o.w, 9);
    ctx.fillRect(o.x, o.y + 34, o.w, 9);
  } else if (o.kind === 'hay') {
    ctx.fillStyle = '#e0a83c';
    roundRect(ctx, o.x, o.y, o.w, o.h, 18);
    ctx.fill();
    ctx.strokeStyle = '#b57e1e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(o.x + o.w / 2, o.y + o.h / 2, 16, 0.6, 4.4);
    ctx.arc(o.x + o.w / 2, o.y + o.h / 2, 8, 1.2, 5.2);
    ctx.stroke();
  } else if (o.kind === 'oven') {
    ctx.fillStyle = PALETTE.ovenGrey;
    roundRect(ctx, o.x, o.y, o.w, o.h, 8);
    ctx.fill();
    ctx.fillStyle = '#2e3236';
    roundRect(ctx, o.x + 10, o.y + 34, o.w - 20, 52, 6);
    ctx.fill();
    const flick = 0.7 + Math.sin(time * 9 + o.x) * 0.3;
    ctx.fillStyle = `rgba(255, 123, 36, ${flick})`;
    roundRect(ctx, o.x + 18, o.y + 44, o.w - 36, 32, 4);
    ctx.fill();
    ctx.fillStyle = '#ffcf5c';
    ctx.font = 'bold 17px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT!', o.x + o.w / 2, o.y + 20);
    ctx.fillStyle = PALETTE.ovenGrey;
    ctx.fillRect(o.x + o.w - 26, o.y - 26, 16, 28);
  } else if (o.kind === 'pot') {
    ctx.fillStyle = '#3d3d3d';
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, o.y + 8, o.w / 2, 12, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillRect(o.x, o.y + 8, o.w, o.h - 16);
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, o.y + o.h - 8, o.w / 2, 10, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#8be04e';
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, o.y + 6, o.w / 2 - 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (o.kind === 'knife') {
    if (o.state === 'falling' || o.state === 'dropping') {
      // Warning: shadow + glint where it will land.
      ctx.fillStyle = 'rgba(60, 10, 10, 0.35)';
      ctx.beginPath();
      ctx.ellipse(o.x + o.w / 2, GROUND_Y + 4, 30, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffdf3d';
      ctx.font = 'bold 26px Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', o.x + o.w / 2, o.y - 12);
    }
    ctx.save();
    ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
    ctx.fillStyle = PALETTE.knifeBlade;
    ctx.beginPath();
    ctx.moveTo(-6, -46);
    ctx.lineTo(8, -10);
    ctx.lineTo(6, 22);
    ctx.lineTo(-6, 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.knifeHandle;
    roundRect(ctx, -7, 22, 14, 26, 5);
    ctx.fill();
    ctx.restore();
  } else if (o.kind === 'line') {
    // Clothesline across the track at head height.
    ctx.strokeStyle = '#d8c9a3';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(o.x - 30, o.y + 8);
    ctx.lineTo(o.x + o.w + 30, o.y + 8);
    ctx.stroke();
    ctx.fillStyle = '#e76f51';
    ctx.fillRect(o.x - 8, o.y + 8, 16, 22);
    ctx.fillStyle = '#2a9d8f';
    ctx.fillRect(o.x + o.w - 8, o.y + 8, 16, 22);
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 15px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DUCK!', o.x + o.w / 2, o.y - 12);
  }
}

function drawCorn(ctx, c, time) {
  const bobY = Math.sin(time * 5 + c.x * 0.05) * 3;
  ctx.save();
  ctx.translate(c.x, c.y + bobY);
  ctx.rotate(-0.5);
  ctx.fillStyle = '#f4c20d';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d99e06';
  for (let r = -1; r <= 1; r++) {
    for (let col = -1; col <= 1; col++) {
      ctx.beginPath();
      ctx.arc(col * 6, r * 10, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#5d8a3c';
  ctx.beginPath();
  ctx.moveTo(-8, 12);
  ctx.lineTo(0, 26);
  ctx.lineTo(8, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawForestGate(ctx, distance) {
  // The escape gate appears in the last stretch of the run.
  const progress = Math.max(0, Math.min(1, (distance - 880) / 120));
  if (progress <= 0) return;
  const gx = VIEW_W - progress * (VIEW_W - 900) + (1 - progress) * 400;
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.arc(gx, GROUND_Y - 150, 90, 0, Math.PI * 2);
  ctx.arc(gx + 170, GROUND_Y - 140, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b4332';
  ctx.fillRect(gx - 8, GROUND_Y - 120, 20, 120);
  ctx.fillRect(gx + 162, GROUND_Y - 110, 20, 110);
  ctx.fillStyle = '#b7e4c7';
  ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FREEDOM FOREST', gx + 85, GROUND_Y - 272);
}

export function drawWorld(ctx, snap, time) {
  const { world, turkey } = snap;
  drawSky(ctx, world.scrollX, time);
  drawBarn(ctx, world.scrollX);
  drawGround(ctx, world.scrollX);
  drawForestGate(ctx, world.distance);
  // Falling leaves.
  for (const l of world.leaves) {
    ctx.save();
    ctx.translate(l.x + Math.sin(l.sway) * 8, l.y);
    ctx.rotate(l.sway * 0.4);
    ctx.fillStyle = l.color;
    ctx.fillRect(-l.size / 2, -l.size / 2, l.size, l.size * 0.7);
    ctx.restore();
  }
  // Oven smoke.
  for (const s of world.smoke) {
    ctx.fillStyle = `rgba(220, 220, 220, ${Math.max(0, s.life * 0.45)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const c of world.corns) drawCorn(ctx, c, time);
  for (const o of world.obstacles) drawObstacle(ctx, o, time);
  drawFarmer(ctx, world.farmerGap, time);
  drawTurkey(ctx, turkey, time);
}

export function drawTitle(ctx, best) {
  ctx.fillStyle = 'rgba(40, 18, 4, 0.45)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 84px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('GOBBLE DASH', VIEW_W / 2, 150);
  ctx.fillStyle = '#ffb703';
  ctx.font = 'bold 44px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('TURKEY ESCAPE', VIEW_W / 2, 208);
  ctx.fillStyle = '#ffe9b8';
  ctx.font = '26px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Thanksgiving is coming. The farmer is coming faster.', VIEW_W / 2, 258);
  ctx.fillText('Run 1000 m through the farm to the Freedom Forest —', VIEW_W / 2, 292);
  ctx.fillText('jump fences, ovens and knives, duck the clothesline, eat corn.', VIEW_W / 2, 326);
  ctx.font = 'bold 22px Verdana, sans-serif';
  ctx.fillStyle = '#fff3d6';
  ctx.fillText('SPACE / ↑ jump    ↓ duck    SHIFT dash    P pause    M mute', VIEW_W / 2, 380);
  ctx.fillText('Click START or press ENTER. 3 hearts — don\'t let the farmer catch you!', VIEW_W / 2, 412);
  const btn = drawButton(ctx, VIEW_W / 2 - 140, 450, 280, 68, '▶  START', true);
  if (best > 0) {
    ctx.fillStyle = '#ffe9b8';
    ctx.font = 'bold 22px Verdana, sans-serif';
    ctx.fillText(`Best score: ${best}`, VIEW_W / 2, 556);
  }
  return [Object.assign(btn, { action: 'confirm' })];
}

export function drawEnd(ctx, result, stats) {
  const escaped = result === 'escaped';
  ctx.fillStyle = escaped ? 'rgba(20, 60, 25, 0.55)' : 'rgba(70, 12, 4, 0.6)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = escaped ? '#b7e4c7' : '#ffb4a2';
  ctx.font = 'bold 88px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(escaped ? 'ESCAPED!' : 'CAUGHT!', VIEW_W / 2, 190);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '28px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(
    escaped
      ? 'You made it to the Freedom Forest. No Thanksgiving dinner today!'
      : 'The farmer got you... but a turkey can always try again.',
    VIEW_W / 2,
    248,
  );
  ctx.font = 'bold 30px Verdana, sans-serif';
  ctx.fillStyle = '#ffe9b8';
  ctx.fillText(`SCORE  ${stats.score}`, VIEW_W / 2, 322);
  ctx.font = '26px Verdana, sans-serif';
  ctx.fillText(
    `Distance ${Math.floor(stats.distance)} m  •  Corn ${stats.corn}  •  Best ${stats.best}`,
    VIEW_W / 2,
    366,
  );
  const btn = drawButton(ctx, VIEW_W / 2 - 140, 410, 280, 68, '↻  PLAY AGAIN', true);
  ctx.fillStyle = '#ffe9b8';
  ctx.font = '22px Verdana, sans-serif';
  ctx.fillText('Press R or click PLAY AGAIN to run again', VIEW_W / 2, 520);
  return [Object.assign(btn, { action: 'restart' })];
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(30, 15, 4, 0.6)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 64px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', VIEW_W / 2, 330);
  ctx.font = '26px Verdana, sans-serif';
  ctx.fillText('Press P to keep running', VIEW_W / 2, 380);
  return [];
}

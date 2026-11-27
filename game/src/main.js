// Gobble Dash: Turkey Escape — game loop and state machine.
// One clear job: own the state (title / playing / paused / caught /
// escaped), step physics + world each frame, resolve collisions and
// scoring, and hand snapshots to the renderer and HUD.

import { GOAL_DISTANCE, GROUND_Y, RUN, SCORE, START_HEARTS, VIEW_H, VIEW_W } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createWorld } from './world.js';
import { createTurkey, currentSpeed, overlaps, tryDash, tryJump, turkeyHitbox, updateFarmerGap, updateTurkey } from './physics.js';
import { drawEnd, drawPaused, drawTitle, drawWorld } from './render.js';
import { drawHint, drawHud } from './hud.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const audio = createAudio();
const input = createInput(canvas, {
  jump: () => onJump(),
  duckStart: () => {},
  duckEnd: () => {},
  dash: () => onDash(),
  pause: () => onPause(),
  mute: () => onMute(),
  restart: () => onRestart(),
  confirm: () => onConfirm(),
  tap: () => audio.unlock(),
});

const world = createWorld();
let turkey = createTurkey();

const game = {
  state: 'title', // title | playing | paused | caught | escaped
  score: 0,
  corn: 0,
  hearts: START_HEARTS,
  best: 0,
  time: 0,
  hint: '',
  hintT: 0,
  autoplay: false,
  over: false,
};

try {
  game.best = Number(localStorage.getItem('gobble-dash-best') || 0) || 0;
} catch (e) {
  game.best = 0;
}

function saveBest() {
  if (game.score > game.best) {
    game.best = game.score;
    try {
      localStorage.setItem('gobble-dash-best', String(game.best));
    } catch (e) { /* storage unavailable: best score just lasts the session */ }
  }
}

function showHint(text, seconds) {
  game.hint = text;
  game.hintT = seconds || 3;
}

function startRun() {
  world.reset();
  turkey = createTurkey();
  game.score = 0;
  game.corn = 0;
  game.hearts = START_HEARTS;
  game.state = 'playing';
  game.over = false;
  audio.unlock();
  audio.gobble();
  showHint('Run! SPACE to jump, SHIFT to dash — the farmer is right behind you!', 4);
}

function endRun(result) {
  game.state = result;
  game.over = true;
  saveBest();
  if (result === 'escaped') audio.escape();
  else audio.caught();
}

function onJump() {
  audio.unlock();
  if (game.state === 'title' || game.state === 'caught' || game.state === 'escaped') {
    startRun();
    return;
  }
  if (game.state !== 'playing') return;
  if (tryJump(turkey)) audio.jump();
}

function onDash() {
  if (game.state !== 'playing') return;
  if (tryDash(turkey)) {
    audio.dash();
    game.score += SCORE.perDash;
    world.state.farmerGap = updateFarmerGap(world.state.farmerGap, 0, turkey, true);
  }
}

function onPause() {
  if (game.state === 'playing') game.state = 'paused';
  else if (game.state === 'paused') game.state = 'playing';
}

function onMute() {
  audio.unlock();
  const muted = audio.toggleMute();
  showHint(muted ? 'Sound muted (M to unmute)' : 'Sound on', 2);
}

function onRestart() {
  if (game.state === 'playing' || game.state === 'paused' || game.state === 'caught' || game.state === 'escaped') {
    startRun();
  }
}

function onConfirm() {
  audio.unlock();
  audio.click();
  if (game.state === 'title' || game.state === 'caught' || game.state === 'escaped') startRun();
}

function hitObstacle(obstacle) {
  game.hearts -= 1;
  turkey.stumbleT = 0.55;
  turkey.invulnerableT = 1.2;
  world.state.farmerGap -= RUN.farmerHitLoss;
  audio.hit();
  if (game.hearts <= 0 || world.state.farmerGap <= RUN.farmerCatchGap) {
    endRun('caught');
  } else {
    showHint(game.hearts === 1 ? 'One heart left! The farmer is close!' : 'Ouch! The farmer gained on you!', 2);
  }
}

function step(dt) {
  game.time += dt;
  if (game.hintT > 0) game.hintT -= dt;

  if (game.state !== 'playing') return;

  const speed = currentSpeed(world.state.distance, turkey);
  updateTurkey(turkey, dt, input, speed);
  world.update(dt, speed);

  // Farmer gap: clean running opens it, stumbling closes it.
  world.state.farmerGap = updateFarmerGap(world.state.farmerGap, dt, turkey, false);
  if (world.state.farmerGap <= RUN.farmerCatchGap) {
    endRun('caught');
    return;
  }

  // Autopilot (playtest helper): jump before solid obstacles, duck
  // under clotheslines, dash across long flat stretches.
  if (game.autoplay) {
    const box = turkeyHitbox(turkey);
    for (const o of world.state.obstacles) {
      const gapPx = o.x - (box.x + box.w);
      if (o.kind === 'line') {
        if (gapPx < 90 && gapPx > -20 && turkey.onGround) {
          // Hold duck by faking the input: set ducking directly.
          turkey.ducking = true;
        }
      } else if (o.state === 'solid' || o.state === 'falling') {
        if (gapPx < 150 && gapPx > -10 && turkey.onGround) {
          if (tryJump(turkey)) audio.jump();
        }
      }
    }
    if (turkey.onGround && turkey.dashCooldown <= 0 && Math.random() < dt * 0.25) {
      tryDash(turkey);
    }
  }

  // Collisions with solid obstacles.
  const box = turkeyHitbox(turkey);
  if (turkey.invulnerableT <= 0) {
    for (const o of world.state.obstacles) {
      if (o.state !== 'solid') continue;
      if (o.duckUnder) {
        // Clothesline: only hits a turkey standing tall.
        if (!turkey.ducking && overlaps(box, { x: o.x, y: o.y, w: o.w + 60, h: 10 })) {
          hitObstacle(o);
          break;
        }
      } else if (overlaps(box, { x: o.x, y: o.y, w: o.w, h: o.h })) {
        hitObstacle(o);
        break;
      }
    }
  }

  // Corn pickup.
  for (const c of world.state.corns) {
    if (!c.taken && overlaps(box, { x: c.x - 16, y: c.y - 20, w: 32, h: 40 })) {
      c.taken = true;
      game.corn += 1;
      game.score += SCORE.perCorn;
      audio.coin();
    }
  }

  // Score from distance.
  game.score = Math.floor(world.state.distance) * SCORE.perMetre + game.corn * SCORE.perCorn;

  // Reaching the forest gate escapes.
  if (world.state.distance >= GOAL_DISTANCE) {
    endRun('escaped');
  }
}

function snapshot() {
  const speed = currentSpeed(world.state.distance, turkey);
  return {
    world: world.state,
    turkey,
    score: game.score,
    corn: game.corn,
    hearts: game.hearts,
    speedKmh: Math.round(speed * 0.12),
    farmerGap: world.state.farmerGap,
    distance: world.state.distance,
    muted: audio.muted,
    dashReady: turkey.dashCooldown <= 0,
  };
}

function render() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  const snap = snapshot();
  drawWorld(ctx, snap, game.time);
  if (game.state === 'playing' || game.state === 'paused') {
    drawHud(ctx, snap);
    if (game.hintT > 0) drawHint(ctx, game.hint);
    if (game.state === 'paused') input.setButtons(drawPaused(ctx));
    else input.setButtons([]);
  } else if (game.state === 'title') {
    input.setButtons(drawTitle(ctx, game.best));
  } else {
    input.setButtons(drawEnd(ctx, game.state, {
      score: game.score,
      distance: world.state.distance,
      corn: game.corn,
      best: game.best,
    }));
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  step(dt);
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Debug / playtest API: real renders of the real game, driven from
// outside so screenshots of every screen can be taken honestly.
window.GOBBLE = {
  get state() { return game.state; },
  get score() { return game.score; },
  get distance() { return world.state.distance; },
  get hearts() { return game.hearts; },
  get corn() { return game.corn; },
  get farmerGap() { return world.state.farmerGap; },
  get cornOnTrack() { return world.state.corns.filter((c) => !c.taken).length; },
  get obstaclesOnScreen() { return world.state.obstacles.filter((o) => o.x > 0 && o.x < VIEW_W).length; },
  start() { startRun(); },
  restart() { startRun(); },
  setAutoplay(on) { game.autoplay = !!on; },
  setDistance(m) {
    world.state.distance = m;
    world.state.nextSpawnAt = m + 60;
    world.state.nextCornRowAt = m + 80;
  },
  setFarmerGap(m) { world.state.farmerGap = m; },
  setHearts(n) { game.hearts = n; },
  forceCaught() {
    if (game.state === 'playing') endRun('caught');
  },
  forceEscaped() {
    if (game.state === 'playing') endRun('escaped');
  },
};

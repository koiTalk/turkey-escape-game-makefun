// Gobble Dash — turkey movement and collisions.
// One clear job: gravity, jumping, ducking, dashing, stumbling, and
// AABB tests against obstacles and corn. No drawing, no spawning.

import { GROUND_Y, PHYSICS, RUN, TURKEY_X } from './config.js';

export function createTurkey() {
  return {
    x: TURKEY_X,
    y: GROUND_Y - 78, // feet on the ground; y is the top of the hitbox
    vy: 0,
    w: 62,
    h: 78,
    onGround: true,
    ducking: false,
    dashT: 0,
    dashCooldown: 0,
    stumbleT: 0,
    runCycle: 0,
    invulnerableT: 0,
  };
}

export function turkeyHitbox(t) {
  if (t.ducking && t.onGround) return { x: t.x, y: GROUND_Y - 46, w: t.w + 6, h: 46 };
  return { x: t.x, y: t.y, w: t.w, h: t.h };
}

export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function updateTurkey(t, dt, input, speedPx) {
  t.runCycle += dt * (6 + speedPx / 60);
  if (t.invulnerableT > 0) t.invulnerableT -= dt;
  if (t.dashCooldown > 0) t.dashCooldown -= dt;
  if (t.stumbleT > 0) t.stumbleT -= dt;

  // Ducking only matters on the ground.
  t.ducking = input.duckHeld && t.onGround;

  if (t.dashT > 0) t.dashT -= dt;

  // Gravity and landing.
  t.vy += PHYSICS.gravity * dt;
  t.y += t.vy * dt;
  if (t.y >= GROUND_Y - t.h) {
    t.y = GROUND_Y - t.h;
    t.vy = 0;
    t.onGround = true;
  } else {
    t.onGround = false;
  }
}

export function tryJump(t) {
  if (!t.onGround || t.stumbleT > 0) return false;
  t.vy = PHYSICS.jumpVelocity;
  t.onGround = false;
  t.ducking = false;
  return true;
}

export function tryDash(t) {
  if (t.dashCooldown > 0 || t.stumbleT > 0) return false;
  t.dashT = PHYSICS.dashTime;
  t.dashCooldown = PHYSICS.dashCooldown;
  return true;
}

export function currentSpeed(distance, t) {
  let speed = Math.min(RUN.maxSpeed, RUN.baseSpeed + distance * RUN.speedGainPerMetre);
  if (t.dashT > 0) speed += PHYSICS.dashVelocity;
  if (t.stumbleT > 0) speed *= PHYSICS.stumbleSlow;
  return speed;
}

// The farmer closes in while the turkey stumbles and falls behind while
// it runs clean or dashes. Returns 'caught' when the gap closes.
export function updateFarmerGap(gap, dt, t, dashed) {
  let g = gap + RUN.farmerRegenPerSec * dt;
  if (t.stumbleT > 0) g -= dt * 14;
  if (dashed) g += RUN.farmerDashGain;
  if (g > RUN.farmerMaxGap) g = RUN.farmerMaxGap;
  return g;
}

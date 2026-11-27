// Gobble Dash — the scrolling farm world: obstacles, corn, knives,
// decorations and the pursuing farmer.
// One clear job: given the distance run, decide what exists on the track
// and where; the physics and renderer only read these lists.

import { CORN, GROUND_Y, OBSTACLES, RUN, STRETCHES, VIEW_W } from './config.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function stretchFor(distance) {
  for (const s of STRETCHES) {
    if (distance >= s.from && distance < s.to) return s;
  }
  return STRETCHES[STRETCHES.length - 1];
}

export function createWorld() {
  const state = {
    distance: 0, // metres run
    scrollX: 0, // pixels scrolled (drives parallax + spawn x)
    obstacles: [], // {kind, x, y, w, h, duckUnder, state, fallT, stuckT}
    corns: [], // {x, y, taken}
    leaves: [], // {x, y, vy, sway, size, color}
    smoke: [], // {x, y, r, life}
    nextSpawnAt: 70, // metres: first obstacle
    nextCornRowAt: 25, // metres: first corn row
    farmerGap: RUN.farmerStartGap, // metres the farmer trails by
    knivesWarned: 0,
  };

  function spawnObstacle(distance) {
    const s = stretchFor(distance);
    const kind = pick(s.kinds);
    const def = OBSTACLES[kind];
    const x = VIEW_W + 120;
    if (kind === 'knife') {
      // A carving knife is telegraphed: it hangs in the air with a
      // warning glint, then drops and sticks in the ground as a
      // jumpable obstacle.
      state.obstacles.push({
        kind, x, y: 60, w: def.w, h: def.h, duckUnder: false,
        state: 'falling', fallT: 0.75, stuckT: 0, vy: 0,
      });
      state.knivesWarned += 1;
    } else if (kind === 'line') {
      // Clothesline: a rope at head height. Duck under it.
      state.obstacles.push({
        kind, x, y: GROUND_Y - 150, w: def.w, h: def.h, duckUnder: true,
        state: 'solid', fallT: 0, stuckT: 0, vy: 0,
      });
    } else {
      state.obstacles.push({
        kind, x, y: GROUND_Y - def.h, w: def.w, h: def.h, duckUnder: false,
        state: 'solid', fallT: 0, stuckT: 0, vy: 0,
      });
    }
    // Sometimes a corn arc flies over the new obstacle: an arc that
    // peaks above it, so a jumping turkey sweeps through the corn.
    if (Math.random() < CORN.arcChance) {
      const baseY = GROUND_Y - def.h - 40;
      for (let i = -2; i <= 2; i++) {
        state.corns.push({ x: x + def.w / 2 + i * 46, y: baseY - (2 - Math.abs(i)) * 30, taken: false });
      }
    }
    const gap = s.gapMin + Math.random() * (s.gapMax - s.gapMin);
    state.nextSpawnAt = distance + gap;
  }

  function spawnCornRow(distance) {
    const n = CORN.rowMin + Math.floor(Math.random() * (CORN.rowMax - CORN.rowMin + 1));
    const x0 = VIEW_W + 120;
    for (let i = 0; i < n; i++) {
      state.corns.push({ x: x0 + i * 44, y: GROUND_Y - 46, taken: false });
    }
    state.nextCornRowAt = distance + 90 + Math.random() * 120;
  }

  function spawnLeaf() {
    const colors = ['#e76f51', '#f4a261', '#c0392b', '#e9c46a'];
    state.leaves.push({
      x: VIEW_W + 20, y: 40 + Math.random() * 220,
      vy: 26 + Math.random() * 30, sway: Math.random() * Math.PI * 2,
      size: 5 + Math.random() * 6, color: pick(colors),
    });
  }

  return {
    state,
    reset() {
      state.distance = 0;
      state.scrollX = 0;
      state.obstacles.length = 0;
      state.corns.length = 0;
      state.leaves.length = 0;
      state.smoke.length = 0;
      state.nextSpawnAt = 70;
      state.nextCornRowAt = 25;
      state.farmerGap = RUN.farmerStartGap;
      state.knivesWarned = 0;
    },
    update(dt, speedPx) {
      const movedPx = speedPx * dt;
      state.scrollX += movedPx;
      state.distance += movedPx * RUN.metresPerPixel;

      if (state.distance >= state.nextSpawnAt) spawnObstacle(state.distance);
      if (state.distance >= state.nextCornRowAt && Math.random() < CORN.rowChance) {
        spawnCornRow(state.distance);
      } else if (state.distance >= state.nextCornRowAt) {
        state.nextCornRowAt = state.distance + 60 + Math.random() * 80;
      }
      if (Math.random() < dt * 2.2) spawnLeaf();

      // Move everything left with the world.
      for (const o of state.obstacles) {
        o.x -= movedPx;
        if (o.kind === 'knife' && o.state === 'falling') {
          o.fallT -= dt;
          if (o.fallT <= 0) {
            o.state = 'dropping';
            o.vy = 60;
          }
        } else if (o.kind === 'knife' && o.state === 'dropping') {
          o.vy += 2600 * dt;
          o.y += o.vy * dt;
          if (o.y >= GROUND_Y - o.h) {
            o.y = GROUND_Y - o.h;
            o.state = 'solid';
            o.stuckT = 1.4;
          }
        } else if (o.kind === 'knife' && o.state === 'solid') {
          o.stuckT -= dt;
        }
      }
      for (const c of state.corns) c.x -= movedPx;
      for (const l of state.leaves) {
        l.x -= movedPx * 0.55;
        l.y += l.vy * dt;
        l.sway += dt * 2;
        if (l.y > GROUND_Y + 10) l.y = 30;
      }
      for (const s of state.smoke) {
        s.y -= 24 * dt;
        s.r += 10 * dt;
        s.life -= dt;
      }

      // Oven chimneys puff smoke.
      for (const o of state.obstacles) {
        if (o.kind === 'oven' && Math.random() < dt * 3) {
          state.smoke.push({ x: o.x + o.w - 14, y: o.y - 26, r: 5, life: 1.6 });
        }
      }

      // Cull what scrolled off the left.
      state.obstacles = state.obstacles.filter((o) => o.x + o.w > -80 && !(o.kind === 'knife' && o.state === 'solid' && o.stuckT <= 0 && o.x < -40));
      state.corns = state.corns.filter((c) => !c.taken && c.x > -40);
      state.leaves = state.leaves.filter((l) => l.x > -30);
      state.smoke = state.smoke.filter((s) => s.life > 0);
    },
  };
}

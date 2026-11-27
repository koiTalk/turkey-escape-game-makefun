// Gobble Dash: Turkey Escape — tuning, constants and level content.
// One clear job: every number the game balances on lives here, so the
// other files read names, not magic numbers.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const GROUND_Y = 600;
export const TURKEY_X = 230;
export const GOAL_DISTANCE = 1000; // metres to the forest gate: reach it and escape
export const START_HEARTS = 3;

export const PHYSICS = {
  gravity: 2600, // px / s^2
  jumpVelocity: -1020, // px / s
  dashVelocity: 620, // extra px / s while dashing
  dashTime: 0.38, // s of dash boost
  dashCooldown: 1.1, // s before the next dash
  stumbleTime: 0.55, // s the turkey is slowed after a hit
  stumbleSlow: 0.45, // speed multiplier while stumbling
};

export const RUN = {
  baseSpeed: 340, // px / s at the farm gate
  maxSpeed: 720, // px / s near the forest
  speedGainPerMetre: 0.38, // px / s added per metre run
  metresPerPixel: 0.045, // world metres per screen pixel scrolled
  farmerStartGap: 30, // metres the farmer trails by at the start
  farmerMaxGap: 42, // metres: never further behind than this
  farmerCatchGap: 0, // metres: gap at/below this means CAUGHT
  farmerRegenPerSec: 0.55, // metres regained per clean second
  farmerHitLoss: 8, // metres lost when the turkey hits an obstacle
  farmerDashGain: 1.6, // metres gained per dash
};

export const SCORE = {
  perMetre: 10,
  perCorn: 25,
  perDash: 5,
};

// Obstacle kinds. height is the hitbox height; duckHeight is the hitbox
// height the turkey needs to slip under a clothesline (ducking only).
export const OBSTACLES = {
  fence: { w: 30, h: 66, label: 'Fence' },
  hay: { w: 76, h: 60, label: 'Hay bale' },
  oven: { w: 86, h: 118, label: 'Oven' },
  pot: { w: 64, h: 42, label: 'Cooking pot' },
  knife: { w: 26, h: 96, label: 'Carving knife' },
  line: { w: 18, h: 200, duckUnder: true, label: 'Clothesline' },
};

// Spawn plan: which obstacles appear in each stretch of the run.
// gapMin/gapMax are metres between spawns; kinds are weighted picks.
export const STRETCHES = [
  { from: 0, to: 150, gapMin: 55, gapMax: 85, kinds: ['fence', 'hay', 'pot'] },
  { from: 150, to: 350, gapMin: 50, gapMax: 80, kinds: ['fence', 'hay', 'pot', 'line', 'knife'] },
  { from: 350, to: 600, gapMin: 45, gapMax: 75, kinds: ['fence', 'hay', 'oven', 'pot', 'line', 'knife'] },
  { from: 600, to: 850, gapMin: 42, gapMax: 70, kinds: ['fence', 'hay', 'oven', 'pot', 'line', 'knife'] },
  { from: 850, to: 1000, gapMin: 48, gapMax: 78, kinds: ['fence', 'hay', 'oven', 'line', 'knife'] },
];

export const CORN = {
  arcChance: 0.55, // chance a spawn also drops a corn arc over it
  rowChance: 0.45, // chance of a flat corn row on open ground
  rowMin: 3,
  rowMax: 5,
};

export const PALETTE = {
  skyTop: '#f7b267',
  skyMid: '#f4845f',
  skyBottom: '#f9d976',
  hillFar: '#c98a4b',
  hillNear: '#8a5a2b',
  ground: '#7a4a21',
  grass: '#5d8a3c',
  grassLight: '#7fb069',
  barnRed: '#a63d2f',
  barnRoof: '#6e2b20',
  leafOrange: '#e76f51',
  leafYellow: '#f4a261',
  leafRed: '#c0392b',
  turkeyBody: '#8d5a2b',
  turkeyDark: '#5e3a17',
  turkeyFeather: '#6b4423',
  turkeyHead: '#d9a066',
  beak: '#e9a319',
  wattle: '#c0392b',
  farmerShirt: '#b3392e',
  farmerHat: '#e0b64f',
  ovenGrey: '#5b6066',
  ovenFire: '#ff7b24',
  knifeBlade: '#dfe6ea',
  knifeHandle: '#4a3226',
  hudBg: 'rgba(40, 20, 8, 0.72)',
  hudText: '#ffe9b8',
  hudAccent: '#ffb703',
};

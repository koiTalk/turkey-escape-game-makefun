# Gobble Dash: Turkey Escape

[![make.fun bounty](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/koiTalk/turkey-escape-game-makefun/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/koiTalk/turkey-escape-game-makefun/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

An original turkey escape game built for the make.fun "Make the best turkey escape game" bounty
([turkey-run-game-01](https://make.fun/bounty/turkey-run-game-01)).

Thanksgiving is coming and the farmer wants you for dinner. You are the turkey:
run 1000 m through the farmyard, past the barn and the kitchen, to the Freedom
Forest — jumping fences, hay bales, ovens and falling carving knives, ducking
the clothesline, eating corn for points, and keeping ahead of the farmer who
chases you the whole way. Get caught and it's dinner time; reach the forest
gate and you escape.

## Play

Open `game/index.html` in desktop Chrome. No build step, no network: every
file the game loads is under `game/`, and it plays fully offline.

- **Keyboard:** Space / ↑ jump, ↓ duck, Shift dash, P pause, M mute, R restart, Enter start.
- **Mouse:** click START / PLAY AGAIN on the title and end screens.
- **Goal:** reach 1000 m. The farmer's distance bar shows how close he is —
  every hit lets him gain on you. 3 hearts; lose them all and you're caught.
- **Score:** distance + corn (25 each) + dash bonus. Speed rises as you run.

## Structure

- `game/index.html` — page, canvas and control hints
- `game/style.css` — page chrome around the canvas
- `game/src/config.js` — tuning, obstacles, stretches, palette
- `game/src/input.js` — keyboard and mouse input
- `game/src/world.js` — obstacle / corn / knife spawning and the farmer
- `game/src/physics.js` — turkey movement, collisions, farmer gap
- `game/src/render.js` — canvas drawing: farm, turkey, farmer, screens
- `game/src/audio.js` — Web Audio gobble, jump, coin, hit and fanfare
- `game/src/hud.js` — HUD: score, distance, hearts, speed, farmer bar
- `game/src/main.js` — game loop and state machine
- `main.ts` — entry program: copies `game/` and `screenshots/` to `/output`
  and writes `/output/dossier.json`
- `screenshots/` — 4 screenshots taken from the running game

## License

MIT — see `LICENSE`.

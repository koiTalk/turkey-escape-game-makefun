// Gobble Dash — keyboard and mouse input.
// One clear job: turn raw key presses and canvas clicks into game
// actions (jump, duck, dash, pause, mute, restart, menu clicks).
// Nothing here knows about the world, physics or drawing.

export function createInput(canvas, handlers) {
  const keys = new Set();
  let duckHeld = false;

  function press(action) {
    if (handlers[action]) handlers[action]();
  }

  function onKeyDown(event) {
    const code = event.code;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
      event.preventDefault();
    }
    if (event.repeat) return;
    keys.add(code);
    switch (code) {
      case 'Space':
      case 'ArrowUp':
      case 'KeyW':
        press('jump');
        break;
      case 'ArrowDown':
      case 'KeyS':
        duckHeld = true;
        press('duckStart');
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'KeyX':
        press('dash');
        break;
      case 'KeyP':
      case 'Escape':
        press('pause');
        break;
      case 'KeyM':
        press('mute');
        break;
      case 'KeyR':
        press('restart');
        break;
      case 'Enter':
        press('confirm');
        break;
      default:
        break;
    }
  }

  function onKeyUp(event) {
    keys.delete(event.code);
    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      duckHeld = false;
      press('duckEnd');
    }
  }

  // Buttons are registered by the renderer as {x, y, w, h, action}.
  // A click inside one fires its action; a click elsewhere is 'tap'.
  let buttons = [];
  function onClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    for (const b of buttons) {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        press(b.action);
        return;
      }
    }
    press('tap');
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('click', onClick);

  return {
    get duckHeld() {
      return duckHeld;
    },
    setButtons(list) {
      buttons = list;
    },
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('click', onClick);
    },
  };
}

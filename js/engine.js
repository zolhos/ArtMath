import { getColorFromPalette } from './palettes.js';
import { SVGContext } from './svg-exporter.js';

export const state = {
  activePreset: 'flowfield',
  paletteKey: 'cyberpunk',
  speed: 1.0,
  opacity: 0.15,
  additive: true,
  continuous: false,
  isPaused: false,
  time: 0
};

export const mouse = {
  x: 0,
  y: 0,
  isPressed: false,
  isOver: false
};

let animationId = null;
let lastTime = 0;
let frameCount = 0;
let canvas = null;
let ctx = null;
let registeredPresets = {};
let onFrameChange = null;

export function initEngine(cElement, presetsRegistry, fpsCallback) {
  canvas = cElement;
  ctx = canvas.getContext('2d');
  registeredPresets = presetsRegistry;
  onFrameChange = fpsCallback;

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setupMouseEvents();
  initActivePreset();

  animationId = requestAnimationFrame(gameLoop);
}

export function getCanvas() { return canvas; }
export function getCtx() { return ctx; }
export function getRegisteredPresets() { return registeredPresets; }

export function getActivePreset() {
  return registeredPresets[state.activePreset];
}

export function initActivePreset() {
  const preset = getActivePreset();
  if (preset) {
    // Limpa o canvas antes de iniciar
    clearCanvas();
    
    // Auto-ajustes baseados no preset
    if (preset.suggestedOpacity !== undefined) {
      state.opacity = preset.suggestedOpacity;
    }
    if (preset.suggestedContinuous !== undefined) {
      state.continuous = preset.suggestedContinuous;
    }

    if (typeof preset.init === 'function') {
      preset.init(canvas, ctx, preset.config);
    }
  }
}

export function clearCanvas() {
  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
  }
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const preset = getActivePreset();
  if (preset && typeof preset.init === 'function') {
    preset.init(canvas, ctx, preset.config);
  }
}

function setupMouseEvents() {
  if (!canvas) return;

  const getCoords = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };

  canvas.addEventListener('mousemove', getCoords);
  canvas.addEventListener('mouseenter', (e) => {
    mouse.isOver = true;
    getCoords(e);
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.isOver = false;
    mouse.isPressed = false;
  });
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      mouse.isPressed = true;
      const preset = getActivePreset();
      if (preset && typeof preset.onClick === 'function') {
        // onClick recebe config, mouse, triggerToast, rebuildUI
        // triggerToast e rebuildUI serão passados pelo main.js ou injetados
        if (window.engineEvents && window.engineEvents.onClick) {
          window.engineEvents.onClick();
        }
      }
    }
  });
  canvas.addEventListener('mouseup', () => {
    mouse.isPressed = false;
  });
}

function gameLoop(now) {
  if (state.isPaused) return;

  if (!lastTime) lastTime = now;
  const delta = now - lastTime;
  frameCount++;
  
  if (delta >= 1000) {
    const fps = Math.round((frameCount * 1000) / delta);
    if (onFrameChange) {
      onFrameChange(`${fps} FPS | Res: ${canvas.width}x${canvas.height}`);
    }
    frameCount = 0;
    lastTime = now;
  }

  state.time += 1.0 * state.speed;

  const preset = getActivePreset();
  if (preset && typeof preset.draw === 'function') {
    preset.draw(
      canvas, 
      ctx, 
      state, 
      preset.config, 
      state.time, 
      mouse, 
      (val) => getColorFromPalette(state.paletteKey, val)
    );
  }

  animationId = requestAnimationFrame(gameLoop);
}

export function togglePause(playCallback, pauseCallback) {
  state.isPaused = !state.isPaused;
  if (state.isPaused) {
    cancelAnimationFrame(animationId);
    if (pauseCallback) pauseCallback();
  } else {
    lastTime = 0;
    animationId = requestAnimationFrame(gameLoop);
    if (playCallback) playCallback();
  }
}

export function stepFrame() {
  if (!state.isPaused) {
    togglePause();
  }
  state.time += 1.0 * state.speed;
  const preset = getActivePreset();
  if (preset && typeof preset.draw === 'function') {
    preset.draw(
      canvas, 
      ctx, 
      state, 
      preset.config, 
      state.time, 
      mouse, 
      (val) => getColorFromPalette(state.paletteKey, val)
    );
  }
}

export function restartSimulation() {
  clearCanvas();
  state.time = 0;
  const preset = getActivePreset();
  if (preset && typeof preset.init === 'function') {
    preset.init(canvas, ctx, preset.config);
  }
}

export function mutateActivePreset() {
  const preset = getActivePreset();
  if (preset) {
    if (typeof preset.onMutate === 'function') {
      preset.onMutate(preset.config);
    }
    // Sorteia paleta cromática
    const keys = ['cyberpunk', 'sunset', 'matrix', 'cosmic', 'amber', 'classic'];
    state.paletteKey = keys[Math.floor(Math.random() * keys.length)];
    
    clearCanvas();
    if (typeof preset.init === 'function') {
      preset.init(canvas, ctx, preset.config);
    }
  }
}

export function exportPNG() {
  if (!canvas) return null;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');

  tempCtx.fillStyle = '#0b0f19';
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.drawImage(canvas, 0, 0);
  
  return tempCanvas.toDataURL('image/png');
}

export function exportToSVG() {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;

  const svgCtx = new SVGContext(width, height);
  const preset = getActivePreset();
  
  if (preset && typeof preset.draw === 'function') {
    preset.draw(
      canvas, 
      svgCtx, 
      state, 
      preset.config, 
      state.time, 
      mouse, 
      (val) => getColorFromPalette(state.paletteKey, val)
    );
  }
  
  return svgCtx.toString();
}

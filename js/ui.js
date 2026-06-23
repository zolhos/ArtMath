import { PALETTES } from './palettes.js';
import { state, getActivePreset, initActivePreset, getRegisteredPresets } from './engine.js';

// Seletores DOM
const presetSelector = document.getElementById('presetSelector');
const presetControlsContainer = document.getElementById('presetControlsContainer');
const mathDescription = document.getElementById('mathDescription');
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');
const slideSpeed = document.getElementById('slideSpeed');
const valSpeed = document.getElementById('valSpeed');
const slideOpacity = document.getElementById('slideOpacity');
const valOpacity = document.getElementById('valOpacity');
const checkAdditive = document.getElementById('checkAdditive');
const checkContinuous = document.getElementById('checkContinuous');
const paletteList = document.getElementById('paletteList');
const paletaName = document.getElementById('paletaName');

export function initUI(onPresetChange) {
  setupGlobalControls();
  renderPaletteUI();
  renderPresetSelectorUI(onPresetChange);
  syncGlobalSettingsToUI();
}

function setupGlobalControls() {
  slideSpeed.addEventListener('input', (e) => {
    state.speed = parseFloat(e.target.value);
    valSpeed.innerText = state.speed.toFixed(1) + 'x';
  });

  slideOpacity.addEventListener('input', (e) => {
    state.opacity = parseFloat(e.target.value);
    valOpacity.innerText = state.opacity;
  });

  checkAdditive.addEventListener('change', (e) => {
    state.additive = e.target.checked;
  });

  checkContinuous.addEventListener('change', (e) => {
    state.continuous = e.target.checked;
  });
}

export function syncGlobalSettingsToUI() {
  slideSpeed.value = state.speed;
  valSpeed.innerText = state.speed.toFixed(1) + 'x';
  slideOpacity.value = state.opacity;
  valOpacity.innerText = state.opacity;
  checkAdditive.checked = state.additive;
  checkContinuous.checked = state.continuous;
}

export function renderPaletteUI() {
  paletteList.innerHTML = '';
  
  Object.keys(PALETTES).forEach(key => {
    const pal = PALETTES[key];
    const btn = document.createElement('button');
    btn.className = `flex flex-col space-y-1 p-1.5 rounded-lg border text-left transition-all ${
      state.paletteKey === key ? 'border-fuchsia-500 bg-fuchsia-950/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
    }`;
    
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'flex space-x-0.5';
    pal.colors.forEach(col => {
      const dot = document.createElement('span');
      dot.className = 'w-2 h-2 rounded-full inline-block';
      dot.style.backgroundColor = col;
      dotsContainer.appendChild(dot);
    });
    
    btn.appendChild(dotsContainer);
    btn.addEventListener('click', () => {
      state.paletteKey = key;
      paletaName.innerText = pal.name;
      renderPaletteUI();
      triggerToast('Paleta alterada para: ' + pal.name);
      
      const preset = getActivePreset();
      if (preset && preset.id === 'flowfield' && typeof preset.init === 'function') {
        preset.init(document.getElementById('artCanvas'), null, preset.config);
      }
    });
    
    paletteList.appendChild(btn);
  });
  paletaName.innerText = PALETTES[state.paletteKey].name;
}

export function renderPresetSelectorUI(onPresetChange) {
  presetSelector.innerHTML = '';
  const presets = getRegisteredPresets();
  
  Object.keys(presets).forEach(key => {
    const preset = presets[key];
    const btn = document.createElement('button');
    btn.setAttribute('data-preset', key);
    
    const isActive = state.activePreset === key;
    btn.className = `preset-btn flex items-center space-x-2 p-2.5 rounded-lg border transition-all font-medium text-xs ${
      isActive 
        ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-300' 
        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
    }`;
    
    btn.innerHTML = `
      <i data-lucide="${preset.icon}" class="w-4 h-4"></i>
      <span>${preset.name}</span>
    `;
    
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => {
        b.className = 'preset-btn flex items-center space-x-2 p-2.5 rounded-lg border bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 transition-all font-medium text-xs';
      });
      btn.className = 'preset-btn flex items-center space-x-2 p-2.5 rounded-lg border bg-indigo-950/20 border-indigo-500/40 text-indigo-300 transition-all font-medium text-xs';
      
      state.activePreset = key;
      onPresetChange();
    });
    
    presetSelector.appendChild(btn);
  });
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

export function renderPresetControls() {
  presetControlsContainer.innerHTML = '';
  const preset = getActivePreset();
  if (!preset || !preset.config) return;

  const h3 = document.createElement('h3');
  h3.className = "text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/60 pb-1";
  h3.innerText = `Variáveis do ${preset.name}`;
  presetControlsContainer.appendChild(h3);

  Object.keys(preset.config).forEach(key => {
    const item = preset.config[key];
    
    const div = document.createElement('div');
    div.className = 'space-y-1';
    
    const labelRow = document.createElement('div');
    labelRow.className = 'flex justify-between items-center';
    
    const label = document.createElement('label');
    label.className = 'text-xs text-slate-300';
    label.innerText = item.label;
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'text-[10px] monospace text-indigo-400';
    valueSpan.innerText = item.value;
    
    labelRow.appendChild(label);
    labelRow.appendChild(valueSpan);
    div.appendChild(labelRow);
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = item.min;
    slider.max = item.max;
    slider.step = item.step;
    slider.value = item.value;
    slider.className = 'w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500';
    
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      valueSpan.innerText = val;
      item.value = val;
      
      if (item.reinit) {
        initActivePreset();
      }
    });
    
    div.appendChild(slider);
    presetControlsContainer.appendChild(div);
  });
}

export function updateMathPanel() {
  const preset = getActivePreset();
  if (!preset) return;
  
  mathDescription.innerHTML = `
    <div class="text-fuchsia-400 font-bold mb-1 border-b border-slate-800 pb-0.5">${preset.id.toUpperCase()} EQUATIONS:</div>
    <pre class="bg-slate-950 p-2 rounded mb-2 overflow-x-auto text-[10px] text-emerald-400">${preset.math}</pre>
    <p class="text-slate-400 font-sans leading-relaxed text-[11px]">${preset.desc}</p>
  `;
}

export function triggerToast(message) {
  toastMessage.innerText = message;
  toastNotification.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
  toastNotification.classList.add('opacity-100', 'translate-y-0');
  
  setTimeout(() => {
    toastNotification.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
    toastNotification.classList.remove('opacity-100', 'translate-y-0');
  }, 2500);
}

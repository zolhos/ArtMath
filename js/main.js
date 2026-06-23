import { presets } from './presets/index.js';
import { 
  initEngine, 
  state, 
  mouse, 
  initActivePreset, 
  togglePause, 
  stepFrame, 
  restartSimulation, 
  mutateActivePreset, 
  exportPNG, 
  exportToSVG,
  getActivePreset
} from './engine.js';
import { 
  initUI, 
  renderPresetControls, 
  updateMathPanel, 
  triggerToast, 
  syncGlobalSettingsToUI,
  renderPaletteUI
} from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('artCanvas');
  const txtFps = document.getElementById('txtFps');
  
  // Elementos de Controle Globais
  const btnPause = document.getElementById('btnPause');
  const iconPause = document.getElementById('iconPause');
  const btnStep = document.getElementById('btnStep');
  const btnRestart = document.getElementById('btnRestart');
  const btnMutate = document.getElementById('btnMutate');
  const btnExport = document.getElementById('btnExport');
  const btnExportSVG = document.getElementById('btnExportSVG');

  // Callback ao trocar presets
  const onPresetChange = () => {
    initActivePreset();
    renderPresetControls();
    updateMathPanel();
    syncGlobalSettingsToUI();
    triggerToast(`Algoritmo trocado para: ${state.activePreset.toUpperCase()}`);
  };

  // Inicializa o Motor Gráfico
  initEngine(canvas, presets, (fpsText) => {
    txtFps.innerText = fpsText;
  });

  // Inicializa a UI
  initUI(onPresetChange);
  
  // Renderiza controles do preset inicial
  renderPresetControls();
  updateMathPanel();

  // Vincula as funções de clique no canvas para presets específicos (como Clifford Attractor)
  window.engineEvents = {
    onClick: () => {
      const preset = getActivePreset();
      if (preset && typeof preset.onClick === 'function') {
        preset.onClick(preset.config, mouse, triggerToast, () => {
          renderPresetControls();
        });
      }
    }
  };

  // Botões de Ação
  btnPause.addEventListener('click', () => {
    togglePause(
      () => { // Ao dar play
        iconPause.setAttribute('data-lucide', 'pause');
        btnPause.querySelector('span').innerText = 'Pausar';
        if (window.lucide) window.lucide.createIcons();
      },
      () => { // Ao pausar
        iconPause.setAttribute('data-lucide', 'play');
        btnPause.querySelector('span').innerText = 'Executar';
        if (window.lucide) window.lucide.createIcons();
      }
    );
  });

  btnStep.addEventListener('click', () => {
    stepFrame();
    // Forçar atualização do ícone de pause
    iconPause.setAttribute('data-lucide', 'play');
    btnPause.querySelector('span').innerText = 'Executar';
    if (window.lucide) window.lucide.createIcons();
    triggerToast('Avançado 1 quadro temporal.');
  });

  btnRestart.addEventListener('click', () => {
    restartSimulation();
    triggerToast('Motor de simulação resetado.');
  });

  btnMutate.addEventListener('click', () => {
    mutateActivePreset();
    renderPaletteUI();
    renderPresetControls();
    updateMathPanel();
    triggerToast('Estética do algoritmo reconfigurada e mutada!');
  });

  btnExport.addEventListener('click', () => {
    const dataUrl = exportPNG();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `art_algoritmica_${state.activePreset}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      triggerToast('Download da renderização PNG iniciado!');
    }
  });

  btnExportSVG.addEventListener('click', () => {
    const svgContent = exportToSVG();
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `art_algoritmica_${state.activePreset}_${Date.now()}.svg`;
    link.href = blobUrl;
    link.click();
    
    URL.revokeObjectURL(blobUrl);
    triggerToast('Download do vetor SVG iniciado com sucesso!');
  });
});

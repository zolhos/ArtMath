export default {
  id: 'attractor',
  name: 'Atrator Clifford',
  icon: 'orbit',
  math: `x[n+1] = sin(a * y) + c * cos(a * x)\\ny[n+1] = sin(b * x) + d * cos(b * y)`,
  desc: 'Uma órbita caótica que resolve equações diferenciais iteradas recursivamente. O caos determinístico gera complexas estruturas espirais ou nébulas orbitais.',

  suggestedOpacity: 0.05,
  suggestedContinuous: true,

  config: {
    a: { label: 'Fator Clifford a', min: -3, max: 3, step: 0.01, value: -1.4 },
    b: { label: 'Fator Clifford b', min: -3, max: 3, step: 0.01, value: 1.6 },
    c: { label: 'Fator Clifford c', min: -3, max: 3, step: 0.01, value: 1.0 },
    d: { label: 'Fator Clifford d', min: -3, max: 3, step: 0.01, value: 0.7 },
    scale: { label: 'Escala / Zoom', min: 50, max: 400, step: 5, value: 180 },
    iterations: { label: 'Amostras de Órbita', min: 1000, max: 15000, step: 500, value: 6000 }
  },

  state: {},

  init() {},

  draw(canvas, ctx, globalState, presetConfig, time, mouse, getColor) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    if (!globalState.continuous) {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.globalCompositeOperation = globalState.additive ? 'screen' : 'source-over';
    ctx.globalAlpha = globalState.opacity;

    let x = Math.sin(time * 0.005);
    let y = Math.cos(time * 0.003);

    const a = presetConfig.a.value + Math.sin(time * 0.001) * 0.1 * globalState.speed;
    const b = presetConfig.b.value;
    const c = presetConfig.c.value;
    const d = presetConfig.d.value;
    const scaleVal = presetConfig.scale.value;
    const iterationsVal = presetConfig.iterations.value;

    ctx.lineWidth = 1;

    for (let i = 0; i < iterationsVal; i++) {
      const xNext = Math.sin(a * y) + c * Math.cos(a * x);
      const yNext = Math.sin(b * x) + d * Math.cos(b * y);

      x = xNext;
      y = yNext;

      const px = width / 2 + x * scaleVal;
      const py = height / 2 + y * scaleVal;

      const radiusVal = Math.sqrt(x * x + y * y) / 2.5;
      ctx.fillStyle = getColor(Math.min(1, Math.max(0, radiusVal)));

      ctx.fillRect(px, py, 1.2, 1.2);
    }

    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  },

  onMutate(presetConfig) {
    presetConfig.a.value = parseFloat((Math.random() * 4 - 2).toFixed(2));
    presetConfig.b.value = parseFloat((Math.random() * 4 - 2).toFixed(2));
    presetConfig.c.value = parseFloat((Math.random() * 2 - 1).toFixed(2));
    presetConfig.d.value = parseFloat((Math.random() * 2 - 1).toFixed(2));
  },

  onClick(presetConfig, mouse, triggerToast, rebuildUI) {
    presetConfig.a.value = parseFloat((Math.random() * 4 - 2).toFixed(2));
    presetConfig.b.value = parseFloat((Math.random() * 4 - 2).toFixed(2));
    rebuildUI();
    triggerToast('Seed do Atrator de Clifford mutado com clique!');
  }
};

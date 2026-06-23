export default {
  id: 'geometry',
  name: 'Harmonia Circular',
  icon: 'snowflake',
  math: `r = baseRadius + sin(θ * petals) * scale\\nx = r * cos(θ + time), y = r * sin(θ + time)`,
  desc: 'Geometria sagrada interativa baseada em polares e ressonância trigonométrica circular. O cursor altera dinamicamente as proporções de pétalas e harmônicas.',

  suggestedOpacity: 0.6,
  suggestedContinuous: false,

  config: {
    petals: { label: 'Número de Lóbulos', min: 1, max: 24, step: 1, value: 7 },
    harmony: { label: 'Modulação Harmônica', min: 0.5, max: 12, step: 0.1, value: 3.2 },
    complexity: { label: 'Complexidade de Linhas', min: 10, max: 500, step: 5, value: 120 }
  },

  state: {},

  init() {},

  draw(canvas, ctx, globalState, presetConfig, time, mouse, getColor) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = globalState.additive ? 'screen' : 'source-over';
    ctx.globalAlpha = globalState.opacity;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.42;

    const petals = presetConfig.petals.value + (mouse.isOver ? (mouse.x / width) * 8 - 4 : 0);
    const harmony = presetConfig.harmony.value + (mouse.isOver ? (mouse.y / height) * 6 - 3 : 0);
    const complexityVal = presetConfig.complexity.value;

    ctx.lineWidth = 1.5;

    for (let i = 0; i < complexityVal; i++) {
      const factor = i / complexityVal;
      const angleOffset = factor * Math.PI * 2 * harmony;
      
      ctx.beginPath();
      
      for (let j = 0; j <= 360; j += 4) {
        const theta = (j * Math.PI) / 180;
        const wave = Math.sin(theta * petals + time * 0.05) * 60;
        const r = factor * maxRadius + wave * Math.cos(time * 0.01 + angleOffset);
        
        const px = centerX + Math.cos(theta + angleOffset) * r;
        const py = centerY + Math.sin(theta + angleOffset) * r;

        if (j === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      
      ctx.closePath();
      ctx.strokeStyle = getColor(factor);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  },

  onMutate(presetConfig) {
    presetConfig.petals.value = Math.floor(Math.random() * 16 + 2);
    presetConfig.harmony.value = parseFloat((Math.random() * 8 + 1).toFixed(1));
    presetConfig.complexity.value = Math.floor(Math.random() * 300 + 40);
  }
};

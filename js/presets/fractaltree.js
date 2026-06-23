export default {
  id: 'fractaltree',
  name: 'Árvore Fractal',
  icon: 'git-branch',
  math: `Branch(len) = Rotate(L) + Branch(len * decay)\\nRotate(R) + Branch(len * decay)\\nwind = sin(time) * force`,
  desc: 'Estruturação recursiva natural imitando árvores biológicas. O vento do sistema interage através de oscilações harmônicas de física de cabo leve.',

  suggestedOpacity: 0.6,
  suggestedContinuous: false,

  config: {
    depth: { label: 'Profundidade Recursiva', min: 4, max: 11, step: 1, value: 8 },
    angle: { label: 'Ângulo de Dispersão', min: 5, max: 90, step: 1, value: 25 },
    decay: { label: 'Decaimento de Galhos', min: 0.5, max: 0.85, step: 0.01, value: 0.78 },
    windStrength: { label: 'Elasticidade de Balanço', min: 0.01, max: 0.3, step: 0.01, value: 0.05 },
    organic: { label: 'Variabilidade Orgânica (0/1)', min: 0, max: 1, step: 1, value: 1 }
  },

  state: {},

  init() {},

  draw(canvas, ctx, globalState, presetConfig, time, mouse, getColor) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = globalState.opacity;

    const rootX = width / 2;
    const rootY = height * 0.88;
    const startLength = height * 0.22;

    const windAngle = Math.sin(time * 0.03) * presetConfig.windStrength.value;
    const maxDepth = presetConfig.depth.value;

    const drawBranch = (x, y, len, angle, depth, wind) => {
      if (depth === 0) return;

      const endX = x + Math.cos(angle) * len;
      const endY = y + Math.sin(angle) * len;

      ctx.lineWidth = depth * 1.5;
      ctx.strokeStyle = getColor(1 - depth / maxDepth);
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const nextLen = len * presetConfig.decay.value;
      const radAngle = (presetConfig.angle.value * Math.PI) / 180;
      const organicFactor = presetConfig.organic.value === 1 ? Math.sin(depth + time * 0.01) * 0.05 : 0;

      // Right branch
      drawBranch(
        endX, endY, 
        nextLen, 
        angle + radAngle + wind + organicFactor, 
        depth - 1, 
        wind
      );
      
      // Left branch
      drawBranch(
        endX, endY, 
        nextLen, 
        angle - radAngle + wind - organicFactor, 
        depth - 1, 
        wind
      );
    };

    drawBranch(rootX, rootY, startLength, -Math.PI / 2, maxDepth, windAngle);
    ctx.globalAlpha = 1.0;
  },

  onMutate(presetConfig) {
    presetConfig.depth.value = Math.floor(Math.random() * 4 + 6); // 6 to 9
    presetConfig.angle.value = Math.floor(Math.random() * 55 + 15);
    presetConfig.decay.value = parseFloat((Math.random() * 0.15 + 0.68).toFixed(2));
  }
};

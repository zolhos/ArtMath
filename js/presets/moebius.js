export default {
  id: 'moebius',
  name: 'Faixa de Möbius 3D',
  icon: 'orbit',
  math: `x = (R + v * cos(t*u/2)) * cos(u)\\ny = (R + v * cos(t*u/2)) * sin(u)\\nz = v * sin(t*u/2)`,
  desc: 'Representação tridimensional de uma Faixa de Möbius, uma superfície não orientável que possui apenas um lado e apenas um bordo. A faixa rotaciona continuamente em projeção 3D.',

  suggestedOpacity: 0.75,
  suggestedContinuous: false,

  config: {
    radius: { label: 'Raio Principal (R)', min: 50, max: 200, step: 5, value: 110 },
    width: { label: 'Largura da Faixa (W)', min: 10, max: 80, step: 2, value: 35 },
    ribs: { label: 'Costelas de Conexão', min: 10, max: 120, step: 2, value: 60 },
    stripes: { label: 'Linhas Longitudinais', min: 1, max: 10, step: 1, value: 4 },
    twist: { label: 'Torções (Ímpar = Möbius)', min: 1, max: 5, step: 2, value: 1 },
    zoom: { label: 'Zoom 3D', min: 0.5, max: 3.0, step: 0.1, value: 1.3 }
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

    const R = presetConfig.radius.value;
    const W = presetConfig.width.value;
    const ribs = presetConfig.ribs.value;
    const stripes = presetConfig.stripes.value;
    const twist = presetConfig.twist.value;
    const zoom = presetConfig.zoom.value;

    // Ângulos de rotação 3D contínuos baseados no tempo
    const angleY = time * 0.006;
    const angleX = Math.PI / 4.5 + Math.sin(time * 0.003) * 0.25;

    const project = (x, y, z) => {
      // Rotação no eixo Y
      const xRot = x * Math.cos(angleY) - z * Math.sin(angleY);
      const zRot = x * Math.sin(angleY) + z * Math.cos(angleY);
      // Rotação no eixo X
      const yRot = y * Math.cos(angleX) - zRot * Math.sin(angleX);
      
      return {
        x: centerX + xRot * zoom,
        y: centerY + yRot * zoom
      };
    };

    // 1. Desenha as linhas longitudinais (ao longo da faixa)
    ctx.lineWidth = 1.8;
    for (let s = 0; s < stripes; s++) {
      // Mapeia s de 0..stripes-1 para o intervalo de largura -W a W
      const v = stripes > 1 ? -W + (2 * W * s) / (stripes - 1) : 0;
      ctx.strokeStyle = getColor(s / stripes);

      ctx.beginPath();
      const segments = 100;
      for (let i = 0; i <= segments; i++) {
        const u = (i / segments) * Math.PI * 2;
        
        // Equações paramétricas da Faixa de Möbius
        const x = (R + v * Math.cos((twist * u) / 2)) * Math.cos(u);
        const y = (R + v * Math.cos((twist * u) / 2)) * Math.sin(u);
        const z = v * Math.sin((twist * u) / 2);

        const pt = project(x, y, z);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    // 2. Desenha as costelas transversais (conectoras)
    ctx.lineWidth = 1.0;
    for (let r = 0; r < ribs; r++) {
      const u = (r / ribs) * Math.PI * 2;
      ctx.strokeStyle = getColor((r / ribs + 0.5) % 1.0);

      const x1 = (R - W * Math.cos((twist * u) / 2)) * Math.cos(u);
      const y1 = (R - W * Math.cos((twist * u) / 2)) * Math.sin(u);
      const z1 = -W * Math.sin((twist * u) / 2);

      const x2 = (R + W * Math.cos((twist * u) / 2)) * Math.cos(u);
      const y2 = (R + W * Math.cos((twist * u) / 2)) * Math.sin(u);
      const z2 = W * Math.sin((twist * u) / 2);

      const pt1 = project(x1, y1, z1);
      const pt2 = project(x2, y2, z2);

      ctx.beginPath();
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  },

  onMutate(presetConfig) {
    presetConfig.radius.value = Math.floor(Math.random() * 100 + 70);
    presetConfig.width.value = Math.floor(Math.random() * 40 + 15);
    presetConfig.twist.value = Math.random() > 0.5 ? 3 : 1;
  }
};

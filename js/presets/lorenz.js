export default {
  id: 'lorenz',
  name: 'Atrator de Lorenz 3D',
  icon: 'activity',
  math: `dx/dt = σ * (y - x)\\ndy/dt = x * (ρ - z) - y\\ndz/dt = x * y - β * z`,
  desc: 'Sistema tridimensional caótico de equações diferenciais que modelam convecção atmosférica. As trajetórias espiralam infinitamente em torno de duas asas de borboleta (atratores caóticos).',

  suggestedOpacity: 0.35,
  suggestedContinuous: true,

  config: {
    sigma: { label: 'Sigma (σ)', min: 1, max: 25, step: 0.1, value: 10 },
    rho: { label: 'Rho (ρ)', min: 5, max: 50, step: 0.1, value: 28 },
    beta: { label: 'Beta (β)', min: 0.5, max: 5, step: 0.05, value: 2.66 },
    dt: { label: 'Passo do Tempo (dt)', min: 0.001, max: 0.015, step: 0.001, value: 0.005 },
    zoom: { label: 'Zoom 3D', min: 2, max: 15, step: 0.5, value: 7 },
    particles: { label: 'Tracers Paralelos', min: 5, max: 80, step: 5, value: 30, reinit: true }
  },

  state: {
    points: []
  },

  init(canvas, ctx, presetConfig) {
    this.state.points = [];
    const count = presetConfig.particles.value;
    for (let i = 0; i < count; i++) {
      this.state.points.push({
        x: 0.1 + (Math.random() - 0.5) * 0.08,
        y: 0.1 + (Math.random() - 0.5) * 0.08,
        z: 0.1 + (Math.random() - 0.5) * 0.08
      });
    }
  },

  draw(canvas, ctx, globalState, presetConfig, time, mouse, getColor) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    if (!globalState.continuous) {
      ctx.fillStyle = `rgba(11, 15, 25, ${0.05 * globalState.speed})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.globalCompositeOperation = globalState.additive ? 'screen' : 'source-over';
    ctx.lineWidth = 1.0;

    const sigma = presetConfig.sigma.value;
    const rho = presetConfig.rho.value;
    const beta = presetConfig.beta.value;
    const dt = presetConfig.dt.value;
    const zoom = presetConfig.zoom.value;
    const steps = 15;

    // Rotação automática suave por tempo. Mouse desabilitado para rotação estrita.
    const angleY = time * 0.005;
    const angleX = Math.PI / 4.5; // Inclinação estática fixa

    this.state.points.forEach((p, idx) => {
      ctx.strokeStyle = getColor(idx / this.state.points.length);
      ctx.globalAlpha = globalState.opacity;

      ctx.beginPath();
      
      let prevX = p.x;
      let prevY = p.y;
      let prevZ = p.z;

      for (let s = 0; s < steps; s++) {
        const dx = sigma * (prevY - prevX) * dt;
        const dy = (prevX * (rho - prevZ) - prevY) * dt;
        const dz = (prevX * prevY - beta * prevZ) * dt;

        const nextX = prevX + dx;
        const nextY = prevY + dy;
        const nextZ = prevZ + dz;

        // Rotação Y contínua baseada em tempo
        const xRot1 = prevX * Math.cos(angleY) - prevZ * Math.sin(angleY);
        const zRot1 = prevX * Math.sin(angleY) + prevZ * Math.cos(angleY);
        const yRot1 = prevY * Math.cos(angleX) - zRot1 * Math.sin(angleX);

        const xRot2 = nextX * Math.cos(angleY) - nextZ * Math.sin(angleY);
        const zRot2 = nextX * Math.sin(angleY) + nextZ * Math.cos(angleY);
        const yRot2 = nextY * Math.cos(angleX) - zRot2 * Math.sin(angleX);

        const px1 = width / 2 + xRot1 * zoom;
        const py1 = height * 0.52 + yRot1 * zoom;
        
        const px2 = width / 2 + xRot2 * zoom;
        const py2 = height * 0.52 + yRot2 * zoom;

        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);

        prevX = nextX;
        prevY = nextY;
        prevZ = nextZ;
      }

      ctx.stroke();

      p.x = prevX;
      p.y = prevY;
      p.z = prevZ;
    });

    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  },

  onMutate(presetConfig) {
    presetConfig.sigma.value = parseFloat((Math.random() * 15 + 5).toFixed(1));
    presetConfig.rho.value = parseFloat((Math.random() * 30 + 10).toFixed(1));
    presetConfig.beta.value = parseFloat((Math.random() * 3 + 1).toFixed(2));
  }
};

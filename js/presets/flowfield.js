export default {
  id: 'flowfield',
  name: 'Vector Field',
  icon: 'wind',
  math: `F(x, y) = [cos(θ), sin(θ)]\\nθ = sin(x * f) * cos(y * f) * curl + cos(time)\\nVelocidade: Particle.pos += F(x, y) * Speed`,
  desc: 'Um campo de fluxo vetorial contínuo onde partículas flutuam sobre um mapa de direções trigonométricas complexas que variam harmonicamente ao longo do tempo.',
  
  suggestedOpacity: 0.12,
  suggestedContinuous: false,

  config: {
    density: { label: 'Densidade de Partículas', min: 100, max: 4000, step: 100, value: 1800, reinit: true },
    curl: { label: 'Distorção / Curl', min: 0.5, max: 10, step: 0.1, value: 3.5 },
    scale: { label: 'Frequência do Campo', min: 0.0005, max: 0.015, step: 0.0001, value: 0.003 },
    stepSize: { label: 'Velocidade do Passo', min: 0.5, max: 5, step: 0.1, value: 2.2 },
    interact: { label: 'Interação (0:Não, 1:Atrair, 2:Repelir)', min: 0, max: 2, step: 1, value: 1 }
  },

  state: {
    particles: []
  },

  init(canvas, ctx, presetConfig) {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width / (window.devicePixelRatio || 1);
    const height = rect.height || canvas.height / (window.devicePixelRatio || 1);
    
    this.state.particles = [];
    for (let i = 0; i < presetConfig.density.value; i++) {
      this.state.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        life: Math.random() * 200 + 100,
        maxLife: 300,
        colValue: Math.random()
      });
    }
  },

  draw(canvas, ctx, globalState, presetConfig, time, mouse, getColor) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    if (!globalState.continuous) {
      ctx.fillStyle = `rgba(11, 15, 25, ${0.035 * globalState.speed})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.lineWidth = 1.2;
    ctx.globalCompositeOperation = globalState.additive ? 'screen' : 'source-over';

    const scaleVal = presetConfig.scale.value;
    const curlVal = presetConfig.curl.value;
    const stepSizeVal = presetConfig.stepSize.value;
    const interactVal = presetConfig.interact.value;

    this.state.particles.forEach(p => {
      const fx = p.x * scaleVal;
      const fy = p.y * scaleVal;
      
      let angle = Math.sin(fx * curlVal) * Math.cos(fy * curlVal) * 6.28;
      angle += Math.sin(time * 0.015) * 1.5;

      if (mouse.isOver && interactVal > 0) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const mouseAngle = Math.atan2(dy, dx);
          if (interactVal === 1) { // attract
            angle = angle * 0.4 + mouseAngle * 0.6;
          } else { // repel
            angle = angle * 0.4 + (mouseAngle + Math.PI) * 0.6;
          }
        }
      }

      p.vx = Math.cos(angle) * stepSizeVal * globalState.speed;
      p.vy = Math.sin(angle) * stepSizeVal * globalState.speed;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      p.x += p.vx;
      p.y += p.vy;
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = getColor(p.colValue);
      ctx.globalAlpha = globalState.opacity * (p.life / p.maxLife);
      ctx.stroke();

      p.life -= globalState.speed;

      if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
        p.x = Math.random() * width;
        p.y = Math.random() * height;
        p.life = Math.random() * 200 + 100;
        p.vx = 0;
        p.vy = 0;
      }
    });

    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  },

  onMutate(presetConfig) {
    presetConfig.curl.value = parseFloat((Math.random() * 8 + 1).toFixed(2));
    presetConfig.scale.value = parseFloat((Math.random() * 0.01 + 0.001).toFixed(4));
    presetConfig.stepSize.value = parseFloat((Math.random() * 3 + 1).toFixed(1));
  }
};

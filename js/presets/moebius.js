export default {
  id: 'moebius',
  name: 'Faixa de Möbius 3D',
  icon: 'orbit',
  math: `x = (R + v * cos(t*u/2)) * cos(u)\\ny = (R + v * cos(t*u/2)) * sin(u)\\nz = v * sin(t*u/2)\\nRocket u_pos += speed (2 loops for return)`,
  desc: 'Representação tridimensional de uma Faixa de Möbius com um mini foguete viajando em sua superfície. Por ter apenas um lado, o foguete precisa completar duas voltas (4π) para retornar à sua posição e orientação iniciais.',

  suggestedOpacity: 0.75,
  suggestedContinuous: false,

  config: {
    radius: { label: 'Raio Principal (R)', min: 50, max: 200, step: 5, value: 110 },
    width: { label: 'Largura da Faixa (W)', min: 10, max: 80, step: 2, value: 35 },
    ribs: { label: 'Costelas de Conexão', min: 10, max: 120, step: 2, value: 60 },
    stripes: { label: 'Linhas Longitudinais', min: 1, max: 10, step: 1, value: 4 },
    twist: { label: 'Torções (Ímpar = Möbius)', min: 1, max: 5, step: 2, value: 1, reinit: true },
    rocket: { label: 'Ativar Foguete (0:Não, 1:Sim)', min: 0, max: 1, step: 1, value: 1 },
    zoom: { label: 'Zoom 3D', min: 0.5, max: 3.0, step: 0.1, value: 1.3 }
  },

  state: {
    uRocket: 0
  },

  init(canvas, ctx, presetConfig) {
    this.state.uRocket = 0;
  },

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
    const hasRocket = presetConfig.rocket.value === 1;

    // Ângulos de rotação 3D contínuos baseados no tempo
    const angleY = time * 0.006;
    const angleX = Math.PI / 4.5 + Math.sin(time * 0.003) * 0.25;

    const project = (x, y, z) => {
      const xRot = x * Math.cos(angleY) - z * Math.sin(angleY);
      const zRot = x * Math.sin(angleY) + z * Math.cos(angleY);
      const yRot = y * Math.cos(angleX) - zRot * Math.sin(angleX);
      return {
        x: centerX + xRot * zoom,
        y: centerY + yRot * zoom,
        z: zRot // Mantemos a coordenada Z para ordenação de profundidade simples
      };
    };

    // 1. Desenha as linhas longitudinais (ao longo da faixa)
    ctx.lineWidth = 1.8;
    for (let s = 0; s < stripes; s++) {
      const v = stripes > 1 ? -W + (2 * W * s) / (stripes - 1) : 0;
      ctx.strokeStyle = getColor(s / stripes);

      ctx.beginPath();
      const segments = 100;
      for (let i = 0; i <= segments; i++) {
        const u = (i / segments) * Math.PI * 2;
        
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

    // 3. Atualiza e desenha o Mini Foguete
    if (hasRocket) {
      // Atualiza posição do foguete (caminha ao longo de u)
      this.state.uRocket += 0.015 * globalState.speed;
      const u = this.state.uRocket;

      // Colocamos o foguete ligeiramente deslocado do centro para ficar em cima da fita
      const v = W * 0.45;

      // Posição 3D central do foguete
      const rx = (R + v * Math.cos((twist * u) / 2)) * Math.cos(u);
      const ry = (R + v * Math.cos((twist * u) / 2)) * Math.sin(u);
      const rz = v * Math.sin((twist * u) / 2);

      // Vetor Direcional / Tangente (derivada dP/du)
      const tx = - (twist / 2) * v * Math.sin((twist * u) / 2) * Math.cos(u) - (R + v * Math.cos((twist * u) / 2)) * Math.sin(u);
      const ty = - (twist / 2) * v * Math.sin((twist * u) / 2) * Math.sin(u) + (R + v * Math.cos((twist * u) / 2)) * Math.cos(u);
      const tz = (twist / 2) * v * Math.cos((twist * u) / 2);
      
      const lenT = Math.sqrt(tx * tx + ty * ty + tz * tz);
      const dx = tx / lenT;
      const dy = ty / lenT;
      const dz = tz / lenT;

      // Vetor Transversal (derivada dP/dv - aponta na largura da faixa)
      const vx = Math.cos((twist * u) / 2) * Math.cos(u);
      const vy = Math.cos((twist * u) / 2) * Math.sin(u);
      const vz = Math.sin((twist * u) / 2);
      
      const lenV = Math.sqrt(vx * vx + vy * vy + vz * vz);
      const wx = vx / lenV;
      const wy = vy / lenV;
      const wz = vz / lenV;

      // Dimensões do Foguete
      const L = 12; // Comprimento
      const H = 6;  // Largura

      // Cálculo dos pontos 3D da estrutura do foguete
      // Nariz do foguete (aponta para frente na direção do vetor tangente)
      const noseX = rx + dx * L;
      const noseY = ry + dy * L;
      const noseZ = rz + dz * L;

      // Asas / Base traseira do foguete (recuada na tangente e deslocada na transversal)
      const blX = rx - dx * (L / 2) - wx * (H / 2);
      const blY = ry - dy * (L / 2) - wy * (H / 2);
      const blZ = rz - dz * (L / 2) - wz * (H / 2);

      const brX = rx - dx * (L / 2) + wx * (H / 2);
      const brY = ry - dy * (L / 2) + wy * (H / 2);
      const brZ = rz - dz * (L / 2) + wz * (H / 2);

      // Foguinho (tremulação oscilante para simular chama real de propulsão)
      const flameOsc = 1 + Math.random() * 0.4;
      const flameX = rx - dx * (L * flameOsc) + (Math.random() - 0.5) * 2 * wx;
      const flameY = ry - dy * (L * flameOsc) + (Math.random() - 0.5) * 2 * wy;
      const flameZ = rz - dz * (L * flameOsc) + (Math.random() - 0.5) * 2 * wz;

      // Projeta todos os pontos 3D para 2D no Canvas
      const pNose = project(noseX, noseY, noseZ);
      const pBL = project(blX, blY, blZ);
      const pBR = project(brX, brY, brZ);
      const pFlame = project(flameX, flameY, flameZ);

      // Desenha a chama externa (laranja)
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(pBL.x, pBL.y);
      ctx.lineTo(pFlame.x, pFlame.y);
      ctx.lineTo(pBR.x, pBR.y);
      ctx.closePath();
      ctx.fill();

      // Desenha a chama interna (amarela)
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(pBL.x + (pNose.x - pBL.x) * 0.15, pBL.y + (pNose.y - pBL.y) * 0.15);
      ctx.lineTo(pFlame.x + (pNose.x - pFlame.x) * 0.25, pFlame.y + (pNose.y - pFlame.y) * 0.25);
      ctx.lineTo(pBR.x + (pNose.x - pBR.x) * 0.15, pBR.y + (pNose.y - pBR.y) * 0.15);
      ctx.closePath();
      ctx.fill();

      // Desenha o corpo do Foguete (minimalista, em tons cinza metálico/branco)
      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(pBL.x, pBL.y);
      ctx.lineTo(pNose.x, pNose.y);
      ctx.lineTo(pBR.x, pBR.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Desenha uma pequena janela de cabine (ponto azul celeste no centro)
      const cabineX = rx + dx * (L * 0.15);
      const cabineY = ry + dy * (L * 0.15);
      const cabineZ = rz + dz * (L * 0.15);
      const pCabine = project(cabineX, cabineY, cabineZ);

      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.arc(pCabine.x, pCabine.y, 2, 0, Math.PI * 2);
      ctx.fill();
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

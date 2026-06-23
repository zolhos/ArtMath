export default {
  id: 'mandala',
  name: 'Gerador de Mandalas',
  icon: 'sun',
  math: `θ_mirror = baseAngle ± θ_point\\nWedge: [0, PI / symmetry]\\nDeform: sin(θ * 5) * deformFactor`,
  desc: 'Caleidoscópio dinâmico com simetria reflexiva bilateral (jogo de espelhos) automática. Partículas flutuam livremente. O controle deslizante de deformação permite distorcer as contas (círculos) em flores/estrelas e as linhas de conexão em ondas.',

  suggestedOpacity: 0.65,
  suggestedContinuous: false,

  config: {
    symmetry: { label: 'Eixos de Simetria', min: 3, max: 24, step: 1, value: 8, reinit: true },
    pointsCount: { label: 'Quantidade de Contas', min: 3, max: 15, step: 1, value: 6, reinit: true },
    connectStyle: { label: 'Estilo (0:Teia, 1:Polígono, 2:Círculos)', min: 0, max: 2, step: 1, value: 0 },
    deform: { label: 'Deformação das Contas/Linhas', min: 0, max: 30, step: 1, value: 10 }
  },

  state: {
    points: []
  },

  init(canvas, ctx, presetConfig) {
    const count = presetConfig.pointsCount.value;
    const symmetry = presetConfig.symmetry.value;
    const maxTheta = Math.PI / symmetry;
    
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width / (window.devicePixelRatio || 1);
    const height = rect.height || canvas.height / (window.devicePixelRatio || 1);
    const maxRadius = Math.min(width, height) * 0.45;

    this.state.points = [];
    for (let i = 0; i < count; i++) {
      this.state.points.push({
        r: Math.random() * (maxRadius - 30) + 20,
        theta: Math.random() * maxTheta,
        vr: (Math.random() - 0.5) * 2.5,
        vtheta: (Math.random() - 0.5) * 0.015,
        size: Math.random() * 8 + 4,
        colorVal: Math.random()
      });
    }
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
    const maxRadius = Math.min(width, height) * 0.45;
    
    const symmetry = presetConfig.symmetry.value;
    const connectStyle = presetConfig.connectStyle.value;
    const deformVal = presetConfig.deform.value;

    // Atualiza a física das partículas de forma 100% autônoma (sem mouse)
    const points = this.state.points.map((p) => {
      p.r += p.vr * globalState.speed;
      p.theta += p.vtheta * globalState.speed;

      const maxTheta = Math.PI / symmetry;

      if (p.r < 10) {
        p.r = 10;
        p.vr *= -1;
      } else if (p.r > maxRadius) {
        p.r = maxRadius;
        p.vr *= -1;
      }

      if (p.theta < 0) {
        p.theta = 0;
        p.vtheta *= -1;
      } else if (p.theta > maxTheta) {
        p.theta = maxTheta;
        p.vtheta *= -1;
      }

      return p;
    });

    this.state.points = points;

    if (connectStyle === 0 || connectStyle === 1) {
      // Estilo de Conexão com Deformação de Linha (Linhas Onduladas)
      const isWeb = connectStyle === 0;
      
      const drawSegment = (p1, p2, color) => {
        ctx.strokeStyle = color;
        for (let s = 0; s < symmetry; s++) {
          const baseAngle = (s * Math.PI * 2) / symmetry + time * 0.003;

          // Lado original ondulado
          ctx.beginPath();
          const lineSteps = 20;
          for (let k = 0; k <= lineSteps; k++) {
            const t = k / lineSteps;
            const r = p1.r + (p2.r - p1.r) * t;
            const theta = p1.theta + (p2.theta - p1.theta) * t;
            
            // Deforma a linha adicionando uma oscilação senoidal no raio
            const wave = Math.sin(t * Math.PI) * deformVal;
            const deformedR = r + wave;
            
            const px = centerX + Math.cos(baseAngle + theta) * deformedR;
            const py = centerY + Math.sin(baseAngle + theta) * deformedR;
            
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          // Lado espelhado ondulado
          ctx.beginPath();
          for (let k = 0; k <= lineSteps; k++) {
            const t = k / lineSteps;
            const r = p1.r + (p2.r - p1.r) * t;
            const theta = p1.theta + (p2.theta - p1.theta) * t;
            
            const wave = Math.sin(t * Math.PI) * deformVal;
            const deformedR = r + wave;
            
            const px = centerX + Math.cos(baseAngle - theta) * deformedR;
            const py = centerY + Math.sin(baseAngle - theta) * deformedR;
            
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      };

      if (isWeb) {
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            drawSegment(points[i], points[j], getColor((i + j) / (points.length * 2)));
          }
        }
      } else {
        for (let i = 0; i < points.length; i++) {
          drawSegment(points[i], points[(i + 1) % points.length], getColor(i / points.length));
        }
      }
    } else {
      // Estilo de Contas com Deformação de Círculo (Vira Flores ou Estrelas de Eixos)
      ctx.lineWidth = 1.5;
      points.forEach((p) => {
        ctx.fillStyle = getColor(p.colorVal);
        ctx.strokeStyle = getColor(1 - p.colorVal);
        
        for (let s = 0; s < symmetry; s++) {
          const baseAngle = (s * Math.PI * 2) / symmetry + time * 0.003;

          const drawDeformedBead = (thetaSign) => {
            const px = centerX + Math.cos(baseAngle + thetaSign * p.theta) * p.r;
            const py = centerY + Math.sin(baseAngle + thetaSign * p.theta) * p.r;

            ctx.beginPath();
            const circleSteps = 30;
            for (let c = 0; c <= circleSteps; c++) {
              const cAngle = (c / circleSteps) * Math.PI * 2;
              
              // Deforma o círculo modulando o raio com uma onda senoidal (cria lóbulos florais)
              const cDeform = Math.sin(cAngle * 5) * (deformVal * 0.4);
              const cRadius = Math.max(2, p.size + cDeform);
              
              const cpx = px + Math.cos(cAngle) * cRadius;
              const cpy = py + Math.sin(cAngle) * cRadius;
              if (c === 0) ctx.moveTo(cpx, cpy);
              else ctx.lineTo(cpx, cpy);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          };

          // Conta original
          drawDeformedBead(1);
          // Conta espelhada
          drawDeformedBead(-1);
        }
      });
    }

    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  },

  onMutate(presetConfig) {
    presetConfig.connectStyle.value = Math.floor(Math.random() * 3);
    presetConfig.deform.value = Math.floor(Math.random() * 25);
    this.state.points.forEach(p => {
      p.vr = (Math.random() - 0.5) * 3;
      p.vtheta = (Math.random() - 0.5) * 0.02;
    });
  }
};

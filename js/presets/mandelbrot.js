export default {
  id: 'mandelbrot',
  name: 'Conjunto Mandelbrot',
  icon: 'grid',
  math: `z[n+1] = z[n]^2 + c\\nz[0] = 0, c = x + i*y\\nEscape: |z| > 2 (Iterações Máximas)`,
  desc: 'O fractal mais famoso da matemática. Define fronteiras caóticas infinitamente complexas e auto-semelhantes no plano complexo. Clique em qualquer ponto para centrar e aproximar.',

  suggestedOpacity: 1.0,
  suggestedContinuous: false,

  config: {
    maxIterations: { label: 'Iterações Máximas', min: 10, max: 200, step: 5, value: 65 },
    zoom: { label: 'Zoom Fractal', min: 0.5, max: 150, step: 0.5, value: 1.0 },
    centerX: { label: 'Centro Re (X)', min: -2.0, max: 1.0, step: 0.01, value: -0.7 },
    centerY: { label: 'Centro Im (Y)', min: -1.5, max: 1.5, step: 0.01, value: 0.0 }
  },

  state: {},

  init() {},

  draw(canvas, ctx, globalState, presetConfig, time, mouse, getColor) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Resolução lógica reduzida para garantir suavidade de 60 FPS na renderização dinâmica
    const scaleFactor = 3;
    const w = Math.floor(width / scaleFactor);
    const h = Math.floor(height / scaleFactor);

    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    const maxIt = presetConfig.maxIterations.value;
    const zoom = presetConfig.zoom.value;
    const centerX = presetConfig.centerX.value;
    const centerY = presetConfig.centerY.value;
    
    // Anima a paleta ciclicamente no tempo se não estiver pausado
    const colorOffset = time * 0.008;
    const ratio = w / h;

    for (let py = 0; py < h; py++) {
      const y0 = centerY + ((py / h - 0.5) * 3.0) / zoom;
      
      for (let px = 0; px < w; px++) {
        const x0 = centerX + ((px / w - 0.5) * 3.0 * ratio) / zoom;

        let x = 0.0;
        let y = 0.0;
        let iteration = 0;

        while (x * x + y * y <= 4.0 && iteration < maxIt) {
          const xTemp = x * x - y * y + x0;
          y = 2.0 * x * y + y0;
          x = xTemp;
          iteration++;
        }

        let rColor = 11, gColor = 15, bColor = 25; // Fundo escuro padrão

        if (iteration < maxIt) {
          // Coloração contínua e suave para suavizar as bandas de cores
          const nu = Math.log(Math.log(x * x + y * y) / 2.0) / Math.log(2.0);
          const smoothIter = iteration + 1.0 - nu;
          const normalized = (smoothIter / maxIt + colorOffset) % 1.0;
          
          const colStr = getColor(normalized);
          const rgb = colStr.match(/\d+/g);
          if (rgb) {
            rColor = parseInt(rgb[0]);
            gColor = parseInt(rgb[1]);
            bColor = parseInt(rgb[2]);
          }
        }

        const idx = (py * w + px) * 4;
        data[idx] = rColor;
        data[idx + 1] = gColor;
        data[idx + 2] = bColor;
        data[idx + 3] = 255;
      }
    }

    // Desenha o buffer de pixels no canvas esticado
    const offCanvas = document.createElement('canvas');
    offCanvas.width = w;
    offCanvas.height = h;
    offCanvas.getContext('2d').putImageData(imgData, 0, 0);

    ctx.drawImage(offCanvas, 0, 0, width, height);
  },

  onMutate(presetConfig) {
    presetConfig.maxIterations.value = Math.floor(Math.random() * 80 + 30);
    // Mutar para coordenadas interessantes conhecidas
    const coordinates = [
      { x: -0.743643887037158704752191506114774, y: 0.131825904205311970493132056385139 },
      { x: -1.25066, y: 0.02012 },
      { x: -0.16070135, y: 1.03756625 },
      { x: -0.75, y: 0.1 },
      { x: -1.482, y: 0.0 }
    ];
    const picked = coordinates[Math.floor(Math.random() * coordinates.length)];
    presetConfig.centerX.value = picked.x;
    presetConfig.centerY.value = picked.y;
    presetConfig.zoom.value = parseFloat((Math.random() * 20 + 2).toFixed(1));
  },

  onClick(presetConfig, mouse, triggerToast, rebuildUI) {
    const canvas = document.getElementById('artCanvas');
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const zoom = presetConfig.zoom.value;
    const centerX = presetConfig.centerX.value;
    const centerY = presetConfig.centerY.value;
    const ratio = width / height;

    // Mapeia coordenadas lógicas do clique para o plano complexo
    const clickX = centerX + ((mouse.x / width - 0.5) * 3.0 * ratio) / zoom;
    const clickY = centerY + ((mouse.y / height - 0.5) * 3.0) / zoom;

    presetConfig.centerX.value = parseFloat(clickX.toFixed(5));
    presetConfig.centerY.value = parseFloat(clickY.toFixed(5));
    presetConfig.zoom.value = parseFloat((zoom * 2.0).toFixed(1));

    rebuildUI();
    triggerToast(`Focado em: Re=${presetConfig.centerX.value}, Im=${presetConfig.centerY.value} (Zoom: ${presetConfig.zoom.value}x)`);
  }
};

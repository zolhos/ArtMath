export class SVGContext {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.paths = [];
    this.currentPath = null;
    this.strokeStyle = '#ffffff';
    this.fillStyle = '#000000';
    this.lineWidth = 1;
    this.globalAlpha = 1.0;
    this.globalCompositeOperation = 'source-over';
  }

  // Ignorado para exportação SVG de alta resolução lógica
  scale() {}
  clearRect() {}

  fillRect(x, y, w, h) {
    const fill = this.fillStyle === '#0b0f19' || this.fillStyle === 'rgba(11, 15, 25, 0.035)' ? '#0b0f19' : this.fillStyle;
    this.paths.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${fill}" opacity="${this.globalAlpha.toFixed(3)}" />`);
  }

  beginPath() {
    this.currentPath = [];
  }

  moveTo(x, y) {
    if (this.currentPath) {
      this.currentPath.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
  }

  lineTo(x, y) {
    if (this.currentPath) {
      this.currentPath.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
  }

  closePath() {
    if (this.currentPath) {
      this.currentPath.push('Z');
    }
  }

  stroke() {
    if (this.currentPath && this.currentPath.length > 0) {
      const d = this.currentPath.join(' ');
      const blendStyle = this.globalCompositeOperation === 'screen' ? ' style="mix-blend-mode: screen;"' : '';
      this.paths.push(`<path d="${d}" fill="none" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth.toFixed(2)}"${blendStyle} stroke-opacity="${this.globalAlpha.toFixed(3)}" stroke-linecap="round" />`);
      this.currentPath = null;
    }
  }

  // Métodos adicionados para suportar renderização baseada em buffers de imagem (como o Mandelbrot)
  createImageData(w, h) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    return ctx.createImageData(w, h);
  }

  drawImage(source, x, y, w, h) {
    try {
      const dataUrl = source.toDataURL('image/png');
      this.paths.push(`<image href="${dataUrl}" x="${x}" y="${y}" width="${w}" height="${h}" />`);
    } catch (e) {
      console.warn("Não foi possível incorporar a imagem no SVG:", e);
    }
  }

  toString() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" width="${this.width}" height="${this.height}" style="background-color: #0b0f19;">
<rect width="100%" height="100%" fill="#0b0f19" />
${this.paths.join('\n')}
</svg>`;
  }
}

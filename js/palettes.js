export const PALETTES = {
  cyberpunk: { name: 'Neon Cyberpunk', colors: ['#ff007f', '#7b2cbf', '#3a0ca3', '#4361ee', '#4cc9f0'] },
  sunset: { name: 'Sunset Aura', colors: ['#ff9f1c', '#ffbf69', '#f3c68f', '#2ec4b6', '#011627'] },
  matrix: { name: 'Digital Matrix', colors: ['#39ff14', '#00ff41', '#008f11', '#003b00', '#ffffff'] },
  cosmic: { name: 'Nebula Profunda', colors: ['#ec38bc', '#7303c0', '#03001e', '#fdeff9', '#05c3de'] },
  amber: { name: 'Ouro Mineral', colors: ['#f4a261', '#e9c46a', '#e76f51', '#2a9d8f', '#264653'] },
  classic: { name: 'Minimalista Clássico', colors: ['#ffffff', '#a8a29e', '#78716c', '#44403c', '#1c1917'] }
};

export function lerpColor(a, b, amount) {
  const ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);
  return `rgb(${Math.round(rr)}, ${Math.round(rg)}, ${Math.round(rb)})`;
}

export function getColorFromPalette(paletteKey, value) {
  const palette = PALETTES[paletteKey].colors;
  const len = palette.length;
  const position = value * (len - 1);
  const index = Math.floor(position);
  const frac = position - index;
  
  if (index >= len - 1) return palette[len - 1];
  
  return lerpColor(palette[index], palette[index + 1], frac);
}

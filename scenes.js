// XO Themes – live ASCII wallpapers
(() => {
  const TAU = Math.PI * 2;
  const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
  const vnoise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const s = t => t * t * (3 - 2 * t), u = s(xf), v = s(yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x, y) => vnoise(x, y) * 0.6 + vnoise(x * 2.1, y * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3) * 0.1;
  const RAMP = ' .:-=+*#%@';

  // A grid buffer: chars + palette index per cell
  class Buf {
    constructor(c, r) { this.c = c; this.r = r; this.ch = new Array(c * r).fill(''); this.pc = new Uint8Array(c * r); }
    clear() { this.ch.fill(''); }
    put(x, y, ch, p) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= this.c || y >= this.r || !ch || ch === ' ') return; const i = y * this.c + x; this.ch[i] = ch; this.pc[i] = p; }
    text(x, y, s, p) { for (let i = 0; i < s.length; i++) this.put(x + i, y, s[i], p); }
    art(x, y, lines, p, map) { for (let j = 0; j < lines.length; j++) { const L = lines[j]; for (let i = 0; i < L.length; i++) { const ch = L[i]; if (ch !== ' ') this.put(x + i, y + j, ch, map && map[ch] !== undefined ? map[ch] : p); } } }
  }

  // aspect: cells are taller than wide; ay converts row distance to "column units"
  const AY = 1.55;

  const scenes = [];
  const def = s => scenes.push(s);

  // 1. Cloud Drift
  def({
    id: 'clouds', name: 'Cloud Drift', bg: ['#5fb4f5', '#bfe6ff'],
    pal: ['#ffffff', '#eef7ff', '#d6ebfb', '#b7d9f3', '#fff3b0', '#ffd36b', '#ffb347', '#5b88b8'],
    init(st, c, r) { st.clouds = Array.from({ length: 7 }, (_, i) => ({ x: Math.random() * c, y: 3 + Math.random() * r * 0.7, w: 14 + Math.random() * 22, s: 0.6 + Math.random() * 1.1, seed: i * 17 })); st.birds = []; },
    draw(b, t, st) {
      const { c, r } = b;
      // sun
      const sx = c * 0.82, sy = r * 0.2, R = Math.min(9, c * 0.05);
      for (let y = Math.floor(sy - R * 2); y <= sy + R * 2; y++) for (let x = Math.floor(sx - R * 2.2); x <= sx + R * 2.2; x++) {
        const d = Math.hypot(x - sx, (y - sy) * AY);
        if (d < R) b.put(x, y, d < R * 0.6 ? '@' : '#', d < R * 0.6 ? 4 : 5);
        else if (d < R * 1.9) { const a = Math.atan2((y - sy) * AY, x - sx); const ray = Math.sin(a * 12 + t * 0.8); if (ray > 0.6 && (x + y) % 2 === 0) b.put(x, y, d < R * 1.4 ? '*' : '.', 6); }
      }
      for (const cl of st.clouds) {
        cl.x += cl.s * 0.045; if (cl.x - cl.w > c) { cl.x = -cl.w * 1.2; cl.y = 3 + Math.random() * r * 0.7; }
        const hgt = cl.w * 0.32;
        for (let y = Math.floor(cl.y - hgt); y <= cl.y + hgt * 0.6; y++) for (let x = Math.floor(cl.x - cl.w); x <= cl.x + cl.w; x++) {
          const dx = (x - cl.x) / cl.w, dy = (y - cl.y) * AY / (cl.w * 0.55);
          const n = fbm(x * 0.12 + cl.seed, y * 0.25 + t * 0.05);
          const v = 1 - (dx * dx + dy * dy * (dy < 0 ? 1.4 : 3.5)) + (n - 0.5) * 0.9;
          if (v > 0.05) { const CR = '.:-=+*#'; const k = Math.min(6, Math.floor(v * 9)); b.put(x, y, CR[k], dy > 0.1 ? 3 : v > 0.5 ? 0 : v > 0.25 ? 1 : 2); }
        }
      }
      if (Math.random() < 0.004 && st.birds.length < 3) st.birds.push({ x: -3, y: 4 + Math.random() * r * 0.4, v: 0.25 + Math.random() * 0.15 });
      st.birds = st.birds.filter(bd => { bd.x += bd.v; b.text(bd.x, bd.y + Math.sin(t * 3 + bd.x) * 0.4, Math.sin(t * 9 + bd.x) > 0 ? 'v' : 'w', 7); return bd.x < c + 2; });
    }
  });

  // 2. Koi Pond
  def({
    id: 'koi', name: 'Koi Pond', bg: ['#17a99c', '#0b6b70'],
    pal: ['#8ff0e4', '#4fd1c2', '#ff7b2e', '#ffffff', '#ff3b3b', '#3fae4a', '#6cd36a', '#ff9fd0', '#1f8f86'],
    init(st, c, r) {
      st.fish = Array.from({ length: 4 }, (_, i) => ({ a: 0.3 + Math.random() * 0.25, b: 0.2 + Math.random() * 0.3, ph: Math.random() * TAU, sp: 0.07 + Math.random() * 0.05, col: i % 2 ? 3 : 2, cx: c * (0.25 + 0.5 * Math.random()), cy: r * (0.3 + 0.4 * Math.random()), A: c * (0.2 + Math.random() * 0.2), B: r * (0.18 + Math.random() * 0.15) }));
      st.pads = Array.from({ length: 6 }, () => ({ x: Math.random() * c, y: Math.random() * r, R: 3 + Math.random() * 4, f: Math.random() < 0.5 }));
    },
    draw(b, t, st) {
      const { c, r } = b;
      for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) {
        const v = Math.sin(x * 0.21 + t * 0.9) + Math.sin(y * 0.37 - t * 1.1) + Math.sin((x + y * 1.3) * 0.13 + t * 0.6);
        if (v > 2.35) b.put(x, y, '~', 0); else if (v > 2.0 && (x * 7 + y) % 3 === 0) b.put(x, y, '-', 1); else if (hash(x, y) > 0.993) b.put(x, y, '.', 1);
      }
      const P = (f, s) => [f.cx + f.A * Math.sin(f.a * s + f.ph), f.cy + f.B * Math.sin(f.b * s * 1.7 + f.ph * 2)];
      for (const f of st.fish) {
        const s0 = t * f.sp * 6;
        for (let k = 11; k >= 0; k--) {
          const [px, py] = P(f, s0 - k * 0.22);
          const rad = k < 2 ? 1.9 : k < 7 ? 2.2 - (k - 2) * 0.18 : k < 10 ? 0.9 : 1.6;
          for (let y = Math.floor(py - rad); y <= py + rad; y++) for (let x = Math.floor(px - rad * 1.6); x <= px + rad * 1.6; x++) {
            const d = Math.hypot((x - px) / 1.6, (y - py) * AY / 1.6);
            if (d < rad) {
              let ch, p;
              if (k >= 10) { ch = Math.sin(t * 8 + x) > 0 ? '<' : '{'; p = f.col; }
              else { ch = d < rad * 0.5 ? '@' : d < rad * 0.8 ? '%' : '*'; p = (k === 3 || k === 6) && f.col === 3 ? 4 : (k === 4 && f.col === 2) ? 3 : f.col; }
              b.put(x, y, ch, p);
            }
          }
          if (k === 0) b.put(px, py, 'o', 8);
        }
      }
      for (const p of st.pads) {
        const bob = Math.sin(t * 0.7 + p.x) * 0.3;
        for (let y = Math.floor(p.y - p.R); y <= p.y + p.R; y++) for (let x = Math.floor(p.x - p.R * 1.7); x <= p.x + p.R * 1.7; x++) {
          const dx = (x - p.x), dy = (y - p.y + bob) * AY; const d = Math.hypot(dx, dy) / 1.1;
          const a = Math.atan2(dy, dx);
          if (d < p.R && !(a > -0.25 && a < 0.25)) b.put(x, y, d < p.R * 0.7 ? '#' : '*', d < p.R * 0.6 ? 5 : 6);
        }
        if (p.f) { b.put(p.x - 1, p.y - 1, '*', 7); b.put(p.x, p.y - 1, '@', 7); b.put(p.x + 1, p.y - 1, '*', 7); }
      }
    }
  });

  // 3. Jellyfish
  def({
    id: 'jelly', dark: true, name: 'Jellyfish', bg: ['#0e4a86', '#051a36'],
    pal: ['#ffb3e6', '#ff7fd1', '#d59bff', '#f7e1ff', '#7fd8ff', '#4f8fd6', '#9fc9ff', '#ffd1f0'],
    init(st, c, r) { st.j = Array.from({ length: 5 }, (_, i) => ({ x: c * (0.12 + i * 0.19) + Math.random() * 6, y: r * (0.3 + Math.random() * 0.5), R: 4 + Math.random() * 4, ph: Math.random() * TAU, col: i % 3, dr: (Math.random() - 0.5) * 0.02 })); st.bub = []; },
    draw(b, t, st) {
      const { c, r } = b;
      for (let x = 0; x < c; x += 1) { const ray = Math.sin(x * 0.09 + t * 0.15) + Math.sin(x * 0.031 - t * 0.1); if (ray > 1.3) for (let y = 0; y < r * 0.55; y++) if ((x + y * 3 + Math.floor(t * 2)) % 7 === 0) b.put(x + y * 0.25, y, '|', 5); }
      if (Math.random() < 0.25) st.bub.push({ x: Math.random() * c, y: r + 1, v: 0.08 + Math.random() * 0.12 });
      st.bub = st.bub.filter(o => { o.y -= o.v; b.put(o.x + Math.sin(t * 2 + o.y) * 0.6, o.y, o.v > 0.15 ? 'o' : '°', 6); return o.y > -1; });
      for (const j of st.j) {
        const pulse = (Math.sin(t * 1.6 + j.ph) + 1) / 2; // 0..1
        j.y -= 0.03 + pulse * 0.05; j.x += j.dr + Math.sin(t * 0.3 + j.ph) * 0.02;
        if (j.y < -j.R * 4) { j.y = r + j.R * 2; j.x = Math.random() * c; }
        const R = j.R * (1 + pulse * 0.12), H = j.R * (0.9 - pulse * 0.15);
        for (let y = Math.floor(j.y - H); y <= j.y; y++) for (let x = Math.floor(j.x - R * 1.5); x <= j.x + R * 1.5; x++) {
          const dx = (x - j.x) / (R * 1.5), dy = (y - j.y) * AY / (H * 1.5); const d = dx * dx + dy * dy;
          if (d < 1) b.put(x, y, d > 0.75 ? '#' : d > 0.4 ? '%' : (hash(x, y) > 0.6 ? ':' : '.'), d > 0.75 ? j.col : d > 0.4 ? 7 : 3);
        }
        for (let x = Math.floor(j.x - R * 1.4); x <= j.x + R * 1.4; x++) b.put(x, j.y + 1, Math.sin(x + t * 4) > 0 ? '~' : '-', j.col);
        const n = 5;
        for (let k = 0; k < n; k++) {
          const bx = j.x + (k - (n - 1) / 2) * R * 0.5, L = j.R * (2.6 + (k % 2) * 0.8);
          for (let s = 1; s < L; s++) { const sx = bx + Math.sin(s * 0.5 - t * 2.2 + k) * (s * 0.18); b.put(sx, j.y + 1 + s, s < L * 0.5 ? (k % 2 ? ')' : '(') : (s % 2 ? ':' : '.'), s < L * 0.5 ? j.col : 2); }
        }
      }
    }
  });

  // 4. Paper Boats
  def({
    id: 'boats', name: 'Paper Boats', bg: ['#ff9e7a', '#ffd9a8'],
    pal: ['#ffffff', '#f2f2f2', '#2d6fb5', '#4f9be0', '#8ec9ff', '#fff4c2', '#ffcf5a', '#ff7a59', '#c0563f', '#1f4f8a'],
    init(st, c, r) { st.boats = Array.from({ length: 4 }, (_, i) => ({ x: Math.random() * c, s: 0.03 + Math.random() * 0.05, row: 0.62 + i * 0.09, scale: i })); },
    draw(b, t, st) {
      const { c, r } = b, hz = Math.floor(r * 0.5);
      const sx = c * 0.5, R = Math.min(10, c * 0.06);
      for (let y = hz - Math.ceil(R / AY) - 1; y < hz; y++) for (let x = Math.floor(sx - R); x <= sx + R; x++) { const d = Math.hypot(x - sx, (y - hz + 0.5) * AY); if (d < R) b.put(x, y, d < R * 0.7 ? '@' : '#', d < R * 0.7 ? 5 : 6); }
      for (let x = 0; x < c; x++) if (hash(x, 3) > 0.7) b.put(x, hz - 1 - Math.floor(hash(x, 9) * 2 * 0), '', 0);
      const wave = (x, y) => Math.sin(x * 0.18 + t * 1.2 + y * 0.9) * 0.5 + Math.sin(x * 0.07 - t * 0.7 + y * 0.3) * 0.5;
      for (let y = hz; y < r; y++) {
        const depth = (y - hz) / (r - hz);
        for (let x = 0; x < c; x++) {
          const v = wave(x, y);
          if (y < hz + 3 && Math.abs(x - sx) < R * (1.2 - (y - hz) * 0.2) && (x + y) % 2 === 0) { b.put(x, y, '=', 6); continue; }
          if (v > 0.55) b.put(x, y, '~', depth < 0.3 ? 4 : 3);
          else if (v > 0.1) b.put(x, y, '-', depth < 0.4 ? 3 : 2);
          else if (v > -0.3 && (x + y) % 2) b.put(x, y, '_', depth < 0.5 ? 2 : 9);
        }
      }
      const boatA = ['    /|', '   / |', '  /__|_', '\\_____/'];
      const boatB = ['     /\\', '    /  \\', '   /    \\', ' _/______\\_', ' \\________/'];
      st.boats.sort((a, b2) => a.row - b2.row);
      for (const bt of st.boats) {
        bt.x += bt.s; if (bt.x > c + 4) bt.x = -14;
        const y0 = Math.floor(r * bt.row + wave(bt.x, r * bt.row) * 1.2) - (bt.scale > 1 ? 5 : 4);
        b.art(bt.x, y0, bt.scale > 1 ? boatB : boatA, 0, { '\\': 1, '_': 1 });
      }
      for (let i = 0; i < 3; i++) { const gx = (t * (2 + i) * 1.3 + i * 40) % (c + 20) - 10, gy = 4 + i * 3 + Math.sin(t + i) * 1; b.text(gx, gy, Math.sin(t * 7 + i) > 0 ? '\\/' : '--', 8); }
    }
  });

  // 5. Fireflies
  def({
    id: 'fireflies', dark: true, name: 'Fireflies', bg: ['#07261c', '#020b08'],
    pal: ['#f4ff8a', '#c8ff4d', '#6f9d2e', '#28502a', '#1b3a20', '#13301a', '#a6c8a0', '#3e7a3a'],
    init(st, c, r) { st.f = Array.from({ length: Math.max(30, Math.floor(c * r / 260)) }, () => ({ x: Math.random() * c, y: Math.random() * r * 0.85, sx: Math.random() * 100, sy: Math.random() * 100, ph: Math.random() * TAU, sp: 0.5 + Math.random() })); },
    draw(b, t, st) {
      const { c, r } = b;
      for (let y = 0; y < r * 0.4; y++) for (let x = 0; x < c; x++) if (hash(x, y) > 0.994) b.put(x, y, Math.sin(t * 2 + x * y) > 0.6 ? '+' : '.', 6);
      // tree line silhouette
      for (let x = 0; x < c; x++) {
        const h = Math.floor(r * 0.22 + fbm(x * 0.06, 2) * r * 0.25);
        for (let y = r - h; y < r; y++) { const top = y - (r - h); b.put(x, y, top < 2 ? (hash(x, y) > 0.5 ? '^' : '*') : (hash(x, y) > 0.55 ? '#' : '%'), top < 2 ? 4 : 5); }
      }
      for (let x = 0; x < c; x++) {
        const h = 2 + Math.floor(fbm(x * 0.4, 7) * 5); const sway = Math.sin(t * 1.4 + x * 0.2);
        for (let k = 0; k < h; k++) b.put(x + (k > h / 2 ? Math.round(sway * 0.6) : 0), r - 1 - k, k === h - 1 ? (sway > 0.3 ? '/' : sway < -0.3 ? '\\' : '|') : '|', k < 2 ? 3 : 7);
      }
      for (const f of st.f) {
        f.x += (vnoise(f.sx + t * 0.25, 0) - 0.5) * 0.35 * f.sp; f.y += (vnoise(0, f.sy + t * 0.25) - 0.5) * 0.2 * f.sp;
        if (f.x < 0) f.x += c; if (f.x > c) f.x -= c; if (f.y < 2) f.y = 2; if (f.y > r - 2) f.y = r - 2;
        const glow = Math.sin(t * 2.2 * f.sp + f.ph);
        if (glow > -0.2) {
          if (glow > 0.5) { b.put(f.x - 1, f.y, '-', 2); b.put(f.x + 1, f.y, '-', 2); b.put(f.x, f.y - 1, "'", 2); b.put(f.x, f.y + 1, '.', 2); }
          b.put(f.x, f.y, glow > 0.5 ? '@' : glow > 0.15 ? '*' : '.', glow > 0.5 ? 0 : 1);
        }
      }
    }
  });

  // 6. Moonlit
  def({
    id: 'moon', dark: true, name: 'Moonlit', bg: ['#0c1a52', '#26357f'],
    pal: ['#fff8d6', '#efe2a8', '#c9bd8a', '#ffffff', '#b9c4ff', '#8e9bea', '#6c78c9', '#dfe5ff'],
    init(st, c, r) { st.cl = Array.from({ length: 6 }, (_, i) => ({ x: Math.random() * c, y: 4 + Math.random() * r * 0.7, w: 10 + Math.random() * 18, s: 0.02 + Math.random() * 0.03 })); st.shoot = null; },
    draw(b, t, st) {
      const { c, r } = b;
      for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) { const h = hash(x, y); if (h > 0.988) { const tw = Math.sin(t * (1 + h * 3) + h * 99); b.put(x, y, tw > 0.85 ? '*' : tw > 0.2 ? '+' : '.', tw > 0.85 ? 3 : 7); } }
      const mx = c * 0.72, my = r * 0.28, R = Math.min(11, c * 0.065);
      for (let y = Math.floor(my - R); y <= my + R; y++) for (let x = Math.floor(mx - R * 1.2); x <= mx + R * 1.2; x++) {
        const d = Math.hypot(x - mx, (y - my) * AY), d2 = Math.hypot(x - mx - R * 0.55, (y - my + R * 0.18) * AY);
        if (d < R && d2 > R * 0.85) b.put(x, y, d > R * 0.85 ? '%' : (hash(x, y) > 0.85 ? 'o' : '@'), d > R * 0.85 ? 1 : hash(x, y) > 0.85 ? 2 : 0);
      }
      for (const cl of st.cl) {
        cl.x -= cl.s; if (cl.x + cl.w < 0) { cl.x = c + cl.w; cl.y = 4 + Math.random() * r * 0.7; }
        for (let k = 0; k < 3; k++) { const L = Math.floor(cl.w * (1 - Math.abs(k - 1) * 0.35)); const ox = Math.floor(cl.x + (cl.w - L) / 2 + (k === 1 ? 2 : 0)); for (let i = 0; i < L; i++) b.put(ox + i, cl.y + k, (i + k) % 3 === 0 ? '-' : '=', k === 1 ? 4 : 5); }
      }
      if (!st.shoot && Math.random() < 0.004) st.shoot = { x: Math.random() * c * 0.6, y: 2 + Math.random() * r * 0.3, l: 0 };
      if (st.shoot) { const s = st.shoot; s.l += 1; for (let i = 0; i < 8; i++) b.put(s.x + s.l - i, s.y + (s.l - i) * 0.35, i === 0 ? '*' : '-', i < 3 ? 3 : 6); if (s.l > 40) st.shoot = null; }
    }
  });

  // 7. XO Rain (brand)
  def({
    id: 'xorain', dark: true, name: 'XO Rain', bg: ['#1c0f3d', '#0b0620'],
    pal: ['#e4ff5c', '#c9f03a', '#b8a6ff', '#8f7dff', '#6a5ae0', '#45399c', '#2c2466', '#ff9cc8'],
    init(st, c, r) { st.cols = Array.from({ length: c }, () => ({ y: Math.random() * r * 1.4 - r * 0.3, v: 0.15 + Math.random() * 0.35, L: 6 + Math.floor(Math.random() * 18), on: Math.random() < 0.7 })); },
    draw(b, t, st) {
      const { c, r } = b; const G = 'XOxo×○+';
      for (let x = 0; x < c; x++) {
        const col = st.cols[x] || (st.cols[x] = { y: 0, v: 0.3, L: 10, on: true });
        if (!col.on) { if (Math.random() < 0.01) col.on = true; continue; }
        col.y += col.v; if (col.y - col.L > r) { col.y = -Math.random() * 10; col.v = 0.15 + Math.random() * 0.35; col.on = Math.random() < 0.75; }
        for (let k = 0; k < col.L; k++) {
          const y = Math.floor(col.y) - k; if (y < 0 || y >= r) continue;
          const g = G[(hash(x, y + Math.floor(t * 3 * (k === 0 ? 4 : 1))) * G.length) | 0];
          b.put(x, y, g, k === 0 ? 0 : k < 2 ? 1 : k < 5 ? 2 : k < 9 ? 3 : k < 13 ? 4 : 5);
        }
      }
      // occasional pink XO glyph pulse in the middle
      const pulse = Math.sin(t * 0.5);
      if (pulse > 0.92) { const cx = Math.floor(c / 2) - 6, cy = Math.floor(r / 2) - 2; b.art(cx, cy, ['\\  /  .--.', ' \\/  |    |', ' /\\  |    |', '/  \\  `--`'], 7); }
    }
  });

  // 8. XO Candy (brand)
  def({
    id: 'xocandy', name: 'XO Candy', bg: ['#ffc0dc', '#c8b6ff'],
    pal: ['#d7f25b', '#9c8cff', '#ff6fae', '#ffffff', '#7a63f0', '#b6e63a', '#ffe0ef'],
    init(st, c, r) { st.s = Array.from({ length: 14 }, (_, i) => ({ x: Math.random() * c, y: Math.random() * r, R: 2.5 + Math.random() * 5, a: Math.random() * TAU, va: (Math.random() - 0.5) * 0.02, vy: 0.02 + Math.random() * 0.05, x0: i % 2, col: [0, 1, 2, 3, 4][i % 5] })); },
    draw(b, t, st) {
      const { c, r } = b;
      for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) { if (hash(x, y) > 0.992) b.put(x, y, Math.sin(t * 3 + x + y) > 0.5 ? '+' : '.', 6); }
      for (const s of st.s) {
        s.y -= s.vy; s.a += s.va; s.x += Math.sin(t * 0.4 + s.R) * 0.02; if (s.y < -s.R * 2) { s.y = r + s.R * 2; s.x = Math.random() * c; }
        const ext = s.R * 1.8;
        for (let y = Math.floor(s.y - ext / AY * 1.2); y <= s.y + ext / AY * 1.2; y++) for (let x = Math.floor(s.x - ext); x <= s.x + ext; x++) {
          const dx = x - s.x, dy = (y - s.y) * AY;
          let inside = false, edge = false;
          if (s.x0) { // O ring
            const d = Math.hypot(dx, dy); inside = d < s.R * 1.6 && d > s.R * 0.85; edge = inside && (d > s.R * 1.4 || d < s.R * 1.0);
          } else { // X: two rotated bars
            const ca = Math.cos(s.a), sa = Math.sin(s.a);
            const u = dx * ca + dy * sa, v = -dx * sa + dy * ca, w = s.R * 0.38, L = s.R * 1.6;
            const i1 = Math.abs(u) < L && Math.abs(v) < w, i2 = Math.abs(v) < L && Math.abs(u) < w;
            inside = i1 || i2; edge = inside && ((i1 && Math.abs(v) > w * 0.6) || (i2 && Math.abs(u) > w * 0.6));
          }
          if (inside) b.put(x, y, edge ? '#' : '@', edge && s.col === 0 ? 5 : edge && s.col === 1 ? 4 : s.col);
        }
      }
    }
  });


  // 9. XO Halloween
  const PUMP = [
    '        ,|/        ',
    '   .-~~~~|~~~~-.   ',
    '  /  /\\     /\\  \\  ',
    ' |  /__\\   /__\\  | ',
    ' |       /\\      | ',
    ' |  \\/\\/\\/\\/\\/\\/  | ',
    '  \\  \\/\\/\\/\\/\\/  /  ',
    '   `-.________.-\'   '];
  const XOPUMP = [
    '        ,|/        ',
    '   .-~~~~|~~~~-.   ',
    '  /  \\/     /\\\\  \\  ',
    ' |   /\\    \\__/  | ',
    ' |       /\\      | ',
    ' |  \\/\\/\\/\\/\\/\\/  | ',
    '  \\  \\/\\/\\/\\/\\/  /  ',
    '   `-.________.-\'   '];
  const GHOST = ['   .-"""-.   ', '  /  o o  \\  ', ' |    O    | ', ' |         | ', ' |         | ', ' |_/\\_/\\_/\\| '];
  const HOUSE = [
    '           /\\            ',
    '          /  \\     /\\    ',
    '         /____\\   /  \\   ',
    '    /\\   | [] |  /____\\  ',
    '   /  \\__|    |__| [] |  ',
    '  /____\\ |    | ||    |  ',
    '  | [] | | [] | ||    |  ',
    '  |    |_|____|_||_/\\_|  '];
  const BAT = [['\\  /\\_/\\  /', ' \\/ o o \\/ ', '    `v`    '], ['  _/\\_/\\_  ', ' / \\o o/ \\ ', '/   `v`   \\']];
  def({
    id: 'halloween', dark: true, name: 'XO Halloween', bg: ['#14061f', '#3a0f3a'],
    pal: ['#ff8a1f', '#ffd23f', '#b77bff', '#f4f1ff', '#7dff6b', '#6e5a8c', '#08040e', '#ff4d2e'],
    init(st, c, r) {
      st.bats = Array.from({ length: Math.max(4, Math.round(c / 30)) }, () => ({ x: Math.random() * c, y: 3 + Math.random() * r * 0.35, v: 0.18 + Math.random() * 0.3, p: Math.random() * 6 }));
      st.ghosts = Array.from({ length: 2 }, (_, i) => ({ x: c * (0.22 + i * 0.4), y: r * (0.32 + i * 0.1), p: i * 2.3 }));
      st.pumps = []; const n = Math.max(3, Math.floor(c / 34)); for (let i = 0; i < n; i++) st.pumps.push({ x: Math.round((i + 0.5) * c / n - 10), f: Math.random() * 6, xo: i === Math.floor(n / 2) });
      st.stars = Array.from({ length: Math.round(c * r / 80) }, () => ({ x: Math.random() * c, y: Math.random() * r * 0.6, p: Math.random() * 6 }));
      st.spider = { x: Math.round(c * 0.1) };
    },
    draw(b, t, st) {
      const { c, r } = b;
      for (const s of st.stars) if (Math.sin(t * 1.5 + s.p) > 0.2) b.put(s.x, s.y, '.', 5);
      // big harvest moon
      const mx = c * 0.78, my = r * 0.26, R = Math.min(16, c * 0.08);
      for (let y = Math.floor(my - R); y <= my + R; y++) for (let x = Math.floor(mx - R * 1.8); x <= mx + R * 1.8; x++) { const d = Math.hypot(x - mx, (y - my) * AY); if (d < R) { const n = fbm(x * 0.25, y * 0.35); b.put(x, y, n > 0.63 ? 'o' : d < R * 0.75 ? '@' : '#', n > 0.63 ? 0 : 1); } else if (d < R * 1.35 && hash(x, y + (t * 2 | 0)) > 0.86) b.put(x, y, '.', 0); }
      // witch flying across the moon
      const wx = ((t * 7) % (c + 80)) - 40, wy = my - 2 + Math.sin(t * 0.9) * 3;
      b.art(wx, wy, ['    _/\\_   ', '   (o.o)   ', ' ~~=|==|=====<<<'], 6);
      // haunted house on the hill
      const hx0 = Math.round(c * 0.62), hy0 = r - 3 - HOUSE.length;
      b.art(hx0, hy0, HOUSE, 6, { '[': (Math.sin(t * 3) > -0.6 ? 1 : 6), ']': (Math.sin(t * 3) > -0.6 ? 1 : 6) });
      // bats
      for (const bt of st.bats) { bt.x += bt.v; if (bt.x > c + 12) { bt.x = -12; bt.y = 3 + Math.random() * r * 0.35; } const f = Math.sin(t * 9 + bt.p) > 0 ? 0 : 1; b.art(bt.x, bt.y + Math.sin(t * 2 + bt.p) * 1.5, BAT[f], 5, { 'o': 7 }); }
      // spider on a thread
      const sp = st.spider; const L = 6 + Math.round((Math.sin(t * 0.7) + 1) * 5);
      for (let y = 0; y < L; y++) b.put(sp.x, y, '|', 5); b.art(sp.x - 5, L, [' /\\(oo)/\\ ', '//\\(  )/\\\\'], 3, { 'o': 7 });
      // cobwebs in both top corners
      for (const side of [1, -1]) { const ox = side > 0 ? 0 : c - 1; for (let k = 0; k < 4; k++) { const ang = (k + 0.5) / 4 * Math.PI / 2; for (let d = 0; d < 14; d++) b.put(ox + side * Math.cos(ang) * d * 1.6, Math.sin(ang) * d * 0.7, k === 0 ? '-' : k === 3 ? '|' : (side > 0) === (k === 1) ? '`' : '.', 5); } for (const rr of [5, 9, 13]) for (let a2 = 0.1; a2 < Math.PI / 2; a2 += 0.12) b.put(ox + side * Math.cos(a2) * rr * 1.6, Math.sin(a2) * rr * 0.7, '.', 5); }
      // floating ghosts
      for (const g of st.ghosts) { const gx = g.x + Math.sin(t * 0.35 + g.p) * 16, gy = g.y + Math.sin(t * 1.1 + g.p) * 2.5; b.art(gx, gy, GHOST, 3, { 'o': 6, 'O': 6 }); if (Math.sin(t * 0.8 + g.p) > 0.75) b.text(gx + 14, gy, 'BOO!', 2); }
      // ground, tombstones, glowing jack-o-lanterns
      const gy0 = r - 3;
      for (let x = 0; x < c; x++) { b.put(x, gy0 + 1, x % 4 === 0 ? 'w' : '_', 6); if (x % 3 === 0) b.put(x, gy0 + 2, ',', 5); }
      for (let i = 0; i < st.pumps.length - 1; i++) { const p0 = st.pumps[i], tx = p0.x + 24; if (tx > hx0 - 8 && tx < hx0 + 26) continue; b.art(tx, gy0 - 4, [' .--. ', '/    \\', i % 2 ? '| XO |' : '| RIP|', '|    |', '|____|'], 5); }
      for (const p of st.pumps) { if (p.x + 20 > hx0 && p.x < hx0 + 26) continue; const glow = Math.sin(t * 7 + p.f) + Math.sin(t * 13 + p.f * 2) > -0.4; const art = p.xo ? XOPUMP : PUMP, y0 = gy0 - art.length + 1;
        for (let j = 0; j < art.length; j++) for (let i = 0; i < art[j].length; i++) { const ch = art[j][i]; if (ch === ' ') continue; const face = j >= 2 && j <= 6 && i >= 3 && i <= 16 && ch !== '|'; b.put(p.x + i, y0 + j, ch, j === 0 ? 4 : face ? (glow ? 1 : 7) : 0); }
        if (glow) for (let i = 4; i < 16; i += 3) if (hash(i, (t * 6 | 0) + p.x) > 0.6) b.put(p.x + i, y0 + 4, '.', 1); }
      // creeping fog
      for (let x = 0; x < c; x++) { const n = fbm(x * 0.07 + t * 0.15, t * 0.05); if (n > 0.55) b.put(x, gy0 - Math.round((n - 0.55) * 8), '~', 5); }
      if (Math.random() < 0.1) st.sp = { x: Math.random() * c, y: Math.random() * r * 0.7, t: 0 };
      if (st.sp) { b.put(st.sp.x, st.sp.y, '*', 7); if ((st.sp.t += 1) > 6) st.sp = null; }
    }
  });

  // 10. Pink Matrix
  def({
    id: 'matrix', dark: true, name: 'Pink Matrix', bg: ['#14020f', '#05010a'],
    pal: ['#ffd1ec', '#ff5fb7', '#d43b8e', '#7a1f55', '#3e0f2d'],
    init(st, c) { st.d = Array.from({ length: c }, () => ({ y: -Math.random() * 60, v: 0.25 + Math.random() * 0.6, L: 6 + (Math.random() * 18 | 0) })); },
    draw(b, t, st) {
      const G = 'XO01xo$%#@<>+=*/\\|';
      st.d.forEach((d, x) => { if (x % 2) return; d.y += d.v; if (d.y - d.L > b.r) { d.y = -Math.random() * 30; d.v = 0.25 + Math.random() * 0.6; }
        for (let k = 0; k < d.L; k++) { const y = Math.floor(d.y) - k; if (y < 0) continue; const ch = G[(hash(x, y + (t * 4 | 0)) * G.length) | 0]; b.put(x, y, ch, k === 0 ? 0 : k < 3 ? 1 : k < d.L * 0.6 ? 2 : k < d.L * 0.85 ? 3 : 4); } });
    }
  });

  // 11. Synthwave
  def({
    id: 'synth', dark: true, name: 'Synthwave', bg: ['#2b0a4a', '#0a0420'],
    pal: ['#ffe066', '#ff8b5c', '#ff3fa4', '#b14dff', '#38e1ff', '#5a2a8a'],
    init() {},
    draw(b, t) {
      const { c, r } = b, hz = Math.round(r * 0.55), sx = c / 2, sy = hz - 3, R = Math.min(22, c * 0.13);
      for (let x = 0; x < c; x++) { const m = Math.abs(Math.sin(x * 0.11) * 3 + Math.sin(x * 0.037) * 4); for (let k = 0; k < m; k++) b.put(x, hz - 1 - k, k === Math.ceil(m) - 1 ? '^' : '/', 3); }
      for (let y = Math.floor(sy - R); y <= sy; y++) for (let x = Math.floor(sx - R * 1.7); x <= sx + R * 1.7; x++) { const d = Math.hypot(x - sx, (y - sy) * AY); if (d < R) { const band = (sy - y) / R; if (band < 0.45 && (y + Math.floor(t * 2)) % 3 === 0) continue; b.put(x, y, '#', band > 0.66 ? 0 : band > 0.33 ? 1 : 2); } }
      for (let x = 0; x < c; x++) b.put(x, hz, '=', 2);
      for (let y = hz + 1; y < r; y++) { const z = (y - hz) / (r - hz); const off = (t * 3) % 1; const row = Math.floor((1 / (z + 0.05)) * 2 + t * 3); if (row % 3 === 0) for (let x = 0; x < c; x++) b.put(x, y, '-', 4);
        for (let k = -20; k <= 20; k++) { const x = Math.round(sx + k * (2 + z * 10)); b.put(x, y, k < 0 ? '/' : k > 0 ? '\\' : '|', 3); } }
      if (Math.sin(t * 0.5) > 0.6) for (let x = 0; x < c; x += 9) b.put(x + ((t * 20) % 9), 2 + (x % 5), '+', 4);
    }
  });

  // 12. Snowfall
  def({
    id: 'snow', name: 'Snowfall', bg: ['#a9c7e8', '#e9f2fb'],
    pal: ['#ffffff', '#dceaf7', '#7f9fc4', '#2e5a3a', '#c94b4b', '#ffd36b'],
    init(st, c, r) { st.f = Array.from({ length: Math.round(c * r / 28) }, () => ({ x: Math.random() * c, y: Math.random() * r, v: 0.08 + Math.random() * 0.22, p: Math.random() * 6 })); st.pile = new Float32Array(c); },
    draw(b, t, st) {
      const { c, r } = b;
      for (let i = 0; i < 4; i++) { const tx = Math.round(c * (0.1 + i * 0.27)), h = 10 + (i % 2) * 4; for (let k = 0; k < h; k++) { const w = Math.round(k * 0.7); for (let x = -w; x <= w; x++) b.put(tx + x, r - h - 2 + k, (x + k) % 4 === 0 ? 'o' : '^', (x + k) % 4 === 0 ? (k % 2 ? 4 : 5) : 3); } b.put(tx, r - h - 3, '*', 5); b.text(tx - 1, r - 2, '||', 2); }
      for (const f of st.f) { f.y += f.v; f.x += Math.sin(t + f.p) * 0.05; if (f.y >= r - 1 - st.pile[(f.x | 0 + c) % c] * 0) { if (f.y >= r - 1) { f.y = -1; f.x = Math.random() * c; } } b.put(f.x, f.y, f.v > 0.2 ? '*' : f.v > 0.14 ? '+' : '.', f.v > 0.18 ? 0 : 1); }
      for (let x = 0; x < c; x++) b.put(x, r - 1, x % 2 ? '~' : '-', 0);
    }
  });

  // 13. City Night
  def({
    id: 'city', dark: true, name: 'City Night', bg: ['#0b1030', '#24154a'],
    pal: ['#ffe27a', '#ffb347', '#3a3a6a', '#6b5bd6', '#f4f1ff', '#ff5fb7', '#2a2350'],
    init(st, c, r) { st.b = []; let x = 0; while (x < c) { const w = 6 + (Math.random() * 10 | 0), h = Math.round(r * (0.18 + Math.random() * 0.45)); st.b.push({ x, w, h, s: Math.random() * 99 }); x += w + 1; } st.cars = []; st.stars = Array.from({ length: c }, () => ({ x: Math.random() * c, y: Math.random() * r * 0.4, p: Math.random() * 6 })); },
    draw(b, t, st) {
      const { c, r } = b;
      for (const s of st.stars) if (Math.sin(t + s.p) > 0.5) b.put(s.x, s.y, '.', 4);
      b.text(Math.round(c * 0.12), 3, '(', 4); b.text(Math.round(c * 0.12) + 1, 3, ')', 4);
      for (const bd of st.b) { const top = r - 3 - bd.h; for (let y = top; y < r - 3; y++) for (let x = bd.x; x < bd.x + bd.w; x++) { const edge = x === bd.x || x === bd.x + bd.w - 1 || y === top; if (edge) { b.put(x, y, y === top ? '_' : '|', 2); continue; } const win = (x - bd.x) % 2 === 1 && (y - top) % 2 === 1; if (win) { const on = hash(x, y + Math.floor((t + bd.s) / 6)) > 0.45; b.put(x, y, on ? '#' : '.', on ? (hash(x, y) > 0.8 ? 1 : 0) : 6); } } if (bd.h > r * 0.5) { b.put(bd.x + (bd.w >> 1), top - 1, '|', 2); if (Math.sin(t * 4) > 0) b.put(bd.x + (bd.w >> 1), top - 2, '*', 5); } }
      if (Math.random() < 0.05) st.cars.push({ x: Math.random() < 0.5 ? -4 : c + 4, d: 0 }); st.cars.forEach(cr => { if (!cr.d) cr.d = cr.x < 0 ? 1 : -1; cr.x += cr.d * 0.9; });
      st.cars = st.cars.filter(cr => cr.x > -6 && cr.x < c + 6);
      for (let x = 0; x < c; x++) { b.put(x, r - 3, '=', 2); b.put(x, r - 1, x % 6 < 3 ? '-' : ' ', 2); }
      for (const cr of st.cars) { b.text(cr.x, r - 2, cr.d > 0 ? 'o=o>' : '<o=o', cr.d > 0 ? 0 : 5); }
    }
  });

  // 14. Aurora
  def({
    id: 'aurora', dark: true, name: 'Aurora', bg: ['#020a1a', '#0a1f2e'],
    pal: ['#7dffb3', '#3ee0c5', '#4aa3ff', '#b47dff', '#ff7fd1', '#f4f1ff', '#16324a'],
    init(st, c, r) { st.stars = Array.from({ length: Math.round(c * r / 70) }, () => ({ x: Math.random() * c, y: Math.random() * r * 0.8, p: Math.random() * 6 })); },
    draw(b, t, st) {
      const { c, r } = b;
      for (const s of st.stars) if (Math.sin(t * 1.3 + s.p) > 0.1) b.put(s.x, s.y, '.', 5);
      for (let band = 0; band < 3; band++) for (let x = 0; x < c; x++) {
        const base = r * (0.2 + band * 0.1) + Math.sin(x * 0.05 + t * 0.4 + band) * 4 + Math.sin(x * 0.013 - t * 0.2) * 6;
        const hgt = 4 + fbm(x * 0.05 + t * 0.3, band) * 10;
        for (let k = 0; k < hgt; k++) { const v = 1 - k / hgt; if (hash(x, k + band * 50 + Math.floor(t * 3)) > v + 0.15) continue; b.put(x, base + k, v > 0.7 ? '|' : v > 0.4 ? ':' : '.', (band + (x >> 4)) % 5); }
      }
      for (let x = 0; x < c; x++) { const m = Math.round(Math.abs(Math.sin(x * 0.06) * 3 + Math.sin(x * 0.17) * 2)) + 1; for (let k = 0; k < m; k++) b.put(x, r - 1 - k, '^', 6); }
    }
  });

  // Blue Koi Pond (v1.6, ported 1:1 from Decibel Themes v1.3 Koi Pond): deep blue to azure water, 7 pixel-rendered Japanese koi with real koi silhouettes
  // (rounded head and body, pectoral fins, flowing tail, body wave), ripples, lily pads and light caustics. Separate from the teal Pond theme.
  const KOI_W = [[0, 0.0], [0.025, 0.06], [0.07, 0.098], [0.16, 0.128], [0.28, 0.127], [0.42, 0.105], [0.57, 0.074], [0.72, 0.047], [0.84, 0.03], [0.9, 0.027]];
  const koiW = s => { for (let i = 1; i < KOI_W.length; i++) if (s <= KOI_W[i][0]) { const [a, wa] = KOI_W[i - 1], [b2, wb] = KOI_W[i]; return wa + (wb - wa) * (s - a) / (b2 - a); } return 0.027; };
  const KOI_V = {
    kohaku: { base: '#f8f4ee', fin: 'rgba(255,255,255,.72)', spots: [['#e3401d', 3, 0.095]] },
    showa: { base: '#17171b', fin: 'rgba(235,235,240,.7)', spots: [['#e5481f', 3, 0.14], ['#f6f2ea', 3, 0.11]] },
    sanke: { base: '#f8f4ee', fin: 'rgba(255,255,255,.72)', spots: [['#e3401d', 3, 0.1], ['#141414', 4, 0.055]] },
    ogon: { base: '#e8b43a', fin: 'rgba(255,226,140,.75)', sheen: '#fff2b0', spots: [] },
    aka: { base: '#e6461c', fin: 'rgba(255,170,120,.72)', spots: [['#ff7a3a', 2, 0.1]] },
    orenji: { base: '#ff8a1e', fin: 'rgba(255,200,140,.72)', sheen: '#ffd08a', spots: [] },
    yamabuki: { base: '#ffd43c', fin: 'rgba(255,240,170,.75)', sheen: '#fff6c8', spots: [] }
  };
  def({
    id: 'koiblue', dark: true, name: 'Blue Koi Pond', bg: ['#0d5fb8', '#031c4a'], accent: '#3fa9ff',
    pal: ['#9fd8ff', '#4aa3e8', '#d8f2ff', '#2a6fbf', '#ffffff', '#2f8f45', '#6cd36a', '#ff9fd0'],
    init(st, c, r) {
      const kinds = ['kohaku', 'showa', 'ogon', 'sanke', 'aka', 'yamabuki', 'kohaku', 'orenji'], sizes = [0.25, 0.17, 0.2, 0.16, 0.15, 0.19, 0.14, 0.17];
      // swim zones (relative): open margins and the top band of /markets and /trade, plus free roamers
      const homes = [[0.12, 0.3, 0.88, 0.92], [0.915, 0.3, 0.995, 0.97], [0.12, 0.17, 0.88, 0.29], [0.005, 0.22, 0.085, 0.6], [0.005, 0.55, 0.085, 0.97], [0.1, 0.15, 0.9, 0.9], [0.915, 0.18, 0.995, 0.6]];
      st.koi = kinds.slice(0, 7).map((k, i) => {
        const v = KOI_V[k], spots = [];
        for (const [col, n, R] of v.spots) for (let j = 0; j < n; j++) spots.push([0.06 + hash(i * 7 + j, col.length + 3) * 0.7, (hash(j, i * 13 + 5) - 0.5) * 1.3, R * (0.7 + hash(i, j * 3 + 1) * 0.7), col]);
        if (k === 'kohaku' && i === 6) spots.unshift([0.07, 0, 0.07, '#e3401d']); // tancho-style head spot
        const home = homes[i]; return { k, v, spots, L: sizes[i], home, x: home[0] + (home[2] - home[0]) * hash(i, 91), y: home[1] + (home[3] - home[1]) * hash(i, 97), h: hash(i, 99) * TAU, tr: 0, sp: 0.03 + hash(i, 101) * 0.025, seed: i * 1.7 + 0.3 };
      });
      st.pads = Array.from({ length: 7 }, (_, i) => ({ x: hash(i, 201), y: hash(i, 203), R: 0.028 + hash(i, 207) * 0.028, rot: hash(i, 209) * TAU, f: hash(i, 211) < 0.45 }));
      st.rip = []; st.lt = null; st.lr = null;
    },
    draw(b, t, st) {
      const { c, r } = b;
      // light caustics web
      for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) {
        const v = Math.abs(Math.sin(x * 0.2 + t * 0.55 + Math.sin(y * 0.17 + t * 0.4) * 2) + Math.sin(y * 0.3 - t * 0.45 + Math.sin(x * 0.12 - t * 0.3) * 2));
        if (v < 0.07) b.put(x, y, '~', 2); else if (v < 0.16) b.put(x, y, (x + y) & 1 ? '-' : '~', 0); else if (v < 0.24 && (x * 3 + y) % 4 === 0) b.put(x, y, '.', 1); else if (hash(x, y) > 0.994) b.put(x, y, '°', 3);
      }
      // ripples (random, and behind koi heads)
      if (Math.random() < 0.02 && st.rip.length < 7) st.rip.push({ x: Math.random() * c, y: Math.random() * r, k: 0 });
      if (st.koi && Math.random() < 0.012) { const f = st.koi[(Math.random() * st.koi.length) | 0]; st.rip.push({ x: f.x * c, y: f.y * r, k: 0 }); }
      st.rip = st.rip.filter(R => { R.k += 0.11; const rad = R.k; for (let a = 0; a < TAU; a += 0.5 / Math.max(1, rad)) b.put(R.x + Math.cos(a) * rad * 1.6, R.y + Math.sin(a) * rad, rad < 3 ? 'o' : '.', rad < 5 ? 4 : 0); return R.k < 8; });
    },
    under(ctx, W, H, t) {
      for (let i = 0; i < 3; i++) { const x = W * (0.2 + 0.3 * i) + Math.sin(t * 0.1 + i) * 80, y = H * (0.3 + 0.25 * Math.sin(t * 0.07 + i * 2)); const g = ctx.createRadialGradient(x, y, 0, x, y, H * 0.55); g.addColorStop(0, 'rgba(90,190,255,.20)'); g.addColorStop(1, 'rgba(90,190,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
      ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = '#bfe6ff';
      for (let i = 0; i < 5; i++) { const x = W * (0.1 + i * 0.22) + Math.sin(t * 0.15 + i) * 40; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + W * 0.05, 0); ctx.lineTo(x + W * 0.12, H); ctx.lineTo(x + W * 0.06, H); ctx.fill(); }
      ctx.restore();
    },
    over(ctx, W, H, t, st) {
      if (!st.koi) return;
      const dt = st.lt == null ? 0 : Math.max(0, Math.min(0.1, t - st.lt)); st.lt = t;
      const PX = W > 600 ? 4 : 1, lw = Math.ceil(W / PX), lh = Math.ceil(H / PX);
      if (!st.lr) { try { st.lr = document.createElement('canvas'); } catch (e) { return; } }
      const lr = st.lr; if (lr.width !== lw || lr.height !== lh) { lr.width = lw; lr.height = lh; }
      const x = lr.getContext('2d'); x.clearRect(0, 0, lw, lh);
      const ang = a => Math.atan2(Math.sin(a), Math.cos(a));
      // move koi: slow wandering with smooth turns, steering away from the edges
      for (const f of st.koi) {
        let tgt = (vnoise(t * 0.07 + f.seed * 10, f.seed) - 0.5) * 1.1;
        const px = f.x * W, py = f.y * H, [hx0, hy0, hx1, hy1] = f.home, X0 = hx0 * W, X1 = hx1 * W, Y0 = hy0 * H, Y1 = hy1 * H, mg = Math.min(f.L * H * 0.6, (X1 - X0) * 0.3, (Y1 - Y0) * 0.3);
        let dvx = 0, dvy = 0;
        if (px < X0 + mg) dvx += Math.min(2, (X0 + mg - px) / mg); if (px > X1 - mg) dvx -= Math.min(2, (px - X1 + mg) / mg);
        if (py < Y0 + mg) dvy += Math.min(2, (Y0 + mg - py) / mg); if (py > Y1 - mg) dvy -= Math.min(2, (py - Y1 + mg) / mg);
        if (dvx || dvy) tgt += ang(Math.atan2(dvy, dvx) - f.h) * Math.min(1, Math.hypot(dvx, dvy)) * 2.4;
        const asp = (Y1 - Y0) / (X1 - X0);
        if (asp > 2) tgt += ang((Math.sin(f.h) >= 0 ? Math.PI / 2 : -Math.PI / 2) - f.h) * 0.7; else if (asp < 0.5) tgt += ang((Math.cos(f.h) >= 0 ? 0 : Math.PI) - f.h) * 0.7;
        f.tr += (Math.max(-1.1, Math.min(1.1, tgt)) - f.tr) * Math.min(1, dt * 1.2);
        f.h += f.tr * dt; const v = f.sp * H;
        f.x += Math.cos(f.h) * v * dt / W; f.y += Math.sin(f.h) * v * dt / H;
      }
      const lily = [];
      for (const p of st.pads) { p.x += Math.sin(t * 0.05 + p.rot) * 0.00002; lily.push(p); }
      // draw koi, largest last
      const order = st.koi.slice().sort((a, b2) => a.L - b2.L);
      for (const pass of [0, 1]) for (const f of order) {
        const L = f.L * H / PX, v = f.sp * H / PX, om = 2.2 + f.sp * 30, N = 24;
        const sp = [], A = [];
        let px = f.x * W / PX, py = f.y * H / PX;
        for (let i = 0; i <= N; i++) {
          const s = i / N * 0.9, bend = Math.max(-1.1, Math.min(1.1, f.tr * s * L / Math.max(4, v)));
          const a = f.h + Math.PI - bend + Math.sin(t * om - s * 5.5 + f.seed) * 0.32 * s;
          sp.push([px, py]); A.push(a); px += Math.cos(a) * L * 0.9 / N; py += Math.sin(a) * L * 0.9 / N;
        }
        const at = s => { const i = Math.min(N, Math.round(s / 0.9 * N)); return [sp[i][0], sp[i][1], A[i]]; };
        const outline = () => { x.beginPath(); for (let i = 0; i <= N; i++) { const s = i / N * 0.9, w = koiW(s) * L, a = A[i]; x.lineTo(sp[i][0] + Math.cos(a + Math.PI / 2) * w, sp[i][1] + Math.sin(a + Math.PI / 2) * w); } for (let i = N; i >= 0; i--) { const s = i / N * 0.9, w = koiW(s) * L, a = A[i]; x.lineTo(sp[i][0] + Math.cos(a - Math.PI / 2) * w, sp[i][1] + Math.sin(a - Math.PI / 2) * w); } x.closePath(); };
        if (pass === 0) { x.save(); x.translate(L * 0.06, L * 0.1); outline(); x.fillStyle = 'rgba(0,12,45,.35)'; x.fill(); x.restore(); continue; }
        const V = f.v;
        // tail fin (flowing, two lobes, swishing)
        { const [tx, ty, ta] = at(0.9), sw = Math.sin(t * om - 0.9 * 5.5 + f.seed - 0.6) * 0.45, a = ta + sw, Lt = L * 0.33;
          x.fillStyle = V.fin; x.beginPath(); x.moveTo(tx, ty);
          x.quadraticCurveTo(tx + Math.cos(a + 0.5) * Lt * 0.55, ty + Math.sin(a + 0.5) * Lt * 0.55, tx + Math.cos(a + 0.62) * Lt, ty + Math.sin(a + 0.62) * Lt);
          x.quadraticCurveTo(tx + Math.cos(a + 0.3) * Lt * 1.05, ty + Math.sin(a + 0.3) * Lt * 1.05, tx + Math.cos(a) * Lt * 0.8, ty + Math.sin(a) * Lt * 0.8);
          x.quadraticCurveTo(tx + Math.cos(a - 0.3) * Lt * 1.05, ty + Math.sin(a - 0.3) * Lt * 1.05, tx + Math.cos(a - 0.62) * Lt, ty + Math.sin(a - 0.62) * Lt);
          x.quadraticCurveTo(tx + Math.cos(a - 0.5) * Lt * 0.55, ty + Math.sin(a - 0.5) * Lt * 0.55, tx, ty); x.fill(); }
        // pectoral + pelvic fins
        for (const [s, len, spread] of [[0.2, 0.17, 0.95], [0.5, 0.09, 0.8]]) for (const side of [1, -1]) {
          const [fx, fy, a] = at(s), w = koiW(s) * L * 0.85, flap = Math.sin(t * 2.6 + side + f.seed) * 0.25;
          const bx2 = fx + Math.cos(a + side * Math.PI / 2) * w, by2 = fy + Math.sin(a + side * Math.PI / 2) * w, fa = a + side * (spread + flap);
          x.fillStyle = V.fin; x.beginPath(); x.ellipse(bx2 + Math.cos(fa) * len * L * 0.5, by2 + Math.sin(fa) * len * L * 0.5, len * L * 0.55, len * L * 0.26, fa, 0, TAU); x.fill();
        }
        // body + pattern
        outline(); x.fillStyle = V.base; x.fill();
        x.save(); outline(); x.clip();
        for (const [s, off, R, col] of f.spots) { const [cx, cy, a] = at(s), w = koiW(s) * L; x.fillStyle = col; x.beginPath(); x.ellipse(cx + Math.cos(a + Math.PI / 2) * off * w, cy + Math.sin(a + Math.PI / 2) * off * w, R * L * 1.15, R * L * 0.8, a, 0, TAU); x.fill(); }
        // dorsal sheen / scale highlight along the back
        x.strokeStyle = V.sheen || 'rgba(255,255,255,.35)'; x.globalAlpha = V.sheen ? 0.7 : 0.4; x.lineWidth = Math.max(1, L * 0.035); x.beginPath(); for (let i = 3; i <= 17; i++) x.lineTo(sp[i][0], sp[i][1]); x.stroke(); x.globalAlpha = 1;
        x.restore();
        // eyes
        { const [ex, ey, a] = at(0.055), w = koiW(0.055) * L * 0.72; x.fillStyle = '#0b0b10'; for (const side of [1, -1]) x.fillRect(Math.round(ex + Math.cos(a + side * Math.PI / 2) * w - 0.5), Math.round(ey + Math.sin(a + side * Math.PI / 2) * w - 0.5), 1, 1); }
      }
      // lily pads floating on the surface (with a few lotus flowers)
      for (const p of lily) {
        const cx = p.x * lw, cy = p.y * lh, R = p.R * H / PX, bob = Math.sin(t * 0.5 + p.rot) * 0.4;
        x.fillStyle = 'rgba(0,20,40,.3)'; x.beginPath(); x.ellipse(cx + R * 0.15, cy + R * 0.2, R, R * 0.92, 0, 0, TAU); x.fill();
        x.fillStyle = '#2f8f45'; x.beginPath(); x.moveTo(cx, cy + bob); x.arc(cx, cy + bob, R, p.rot + 0.28, p.rot + TAU - 0.28); x.closePath(); x.fill();
        x.strokeStyle = '#5cbf5a'; x.lineWidth = 1; x.beginPath(); x.arc(cx, cy + bob, R * 0.82, p.rot + 0.35, p.rot + TAU - 0.35); x.stroke();
        if (p.f) { for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + t * 0.05; x.fillStyle = k % 2 ? '#ffb3d6' : '#ff7fb8'; x.beginPath(); x.ellipse(cx + Math.cos(a) * R * 0.28, cy + bob + Math.sin(a) * R * 0.28, R * 0.3, R * 0.14, a, 0, TAU); x.fill(); } x.fillStyle = '#ffe36a'; x.fillRect(Math.round(cx - 1), Math.round(cy + bob - 1), 2, 2); }
      }
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(lr, 0, 0, lw * PX, lh * PX); ctx.restore();
    }
  });

  // theme maker: build a scene from two colours and a motion style
  const hx = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const mix = (a, b2, k) => '#' + hx(a).map((v, i) => Math.round(v + (hx(b2)[i] - v) * k).toString(16).padStart(2, '0')).join('');
  const shade = (a, k) => mix(a, k > 0 ? '#ffffff' : '#000000', Math.abs(k));
  function makeScene(m) {
    const L = (([r2, g2, b3]) => (0.2126 * r2 + 0.7152 * g2 + 0.0722 * b3) / 255)(hx(m.c1));
    const dark = L < 0.5; const ink = dark ? shade(m.c2, 0.25) : shade(m.c2, -0.25);
    const sc = { id: 'm:' + m.id, made: true, dark, name: m.name || 'My theme', bg: [m.c1, shade(m.c1, dark ? -0.45 : 0.35)], pal: [ink, m.c2, mix(m.c1, m.c2, 0.55), mix(m.c1, m.c2, 0.3), dark ? '#ffffff' : '#1a1033'] };
    if (m.style === 'rain') { sc.init = (st, c, r) => { st.d = Array.from({ length: Math.round(c / 2) }, () => ({ x: Math.random() * c, y: Math.random() * r, v: 0.3 + Math.random() * 0.6 })); }; sc.draw = (b, t, st) => { for (const d of st.d) { d.y += d.v; if (d.y > b.r) { d.y = -2; d.x = Math.random() * b.c; } b.put(d.x, d.y, '|', d.v > 0.6 ? 0 : 1); b.put(d.x, d.y - 1, '\'', 2); } }; }
    else if (m.style === 'waves') { sc.init = () => {}; sc.draw = (b, t) => { for (let y = 0; y < b.r; y++) for (let x = 0; x < b.c; x++) { const v = fbm(x * 0.05 + t * 0.25, y * 0.11 + Math.sin(x * 0.03 + t * 0.4) * 0.6); if (v > 0.5) b.put(x, y, v > 0.72 ? '~' : v > 0.6 ? '-' : '.', v > 0.72 ? 0 : v > 0.6 ? 1 : 2); } }; }
    else if (m.style === 'bubbles') { sc.init = (st, c, r) => { st.p = Array.from({ length: Math.round(c * r / 120) }, () => ({ x: Math.random() * c, y: Math.random() * r, v: 0.05 + Math.random() * 0.2, s: Math.random() })); }; sc.draw = (b, t, st) => { for (const p of st.p) { p.y -= p.v; p.x += Math.sin(t + p.s * 9) * 0.05; if (p.y < -2) { p.y = b.r + 2; p.x = Math.random() * b.c; } b.put(p.x, p.y, p.s > 0.7 ? 'O' : p.s > 0.35 ? 'o' : '°', p.s > 0.7 ? 0 : p.s > 0.35 ? 1 : 2); } }; }
    else { sc.init = (st, c, r) => { st.s = Array.from({ length: Math.round(c * r / 40) }, () => ({ x: Math.random() * c, y: Math.random() * r, p: Math.random() * 6, k: Math.random() })); }; sc.draw = (b, t, st) => { for (const s of st.s) { const v = Math.sin(t * (1 + s.k) + s.p); if (v > -0.2) b.put(s.x, s.y, v > 0.85 ? '*' : v > 0.4 ? '+' : '.', v > 0.85 ? 0 : v > 0.4 ? 1 : 3); } }; }
    return sc;
  }

  // Renderer
  class Renderer {
    constructor(canvas, opts = {}) {
      this.cv = canvas; this.ctx = canvas.getContext('2d');
      this.cw = opts.cw || 10; this.chh = opts.ch || 15; this.font = opts.font || `700 ${Math.round(this.chh * 0.86)}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
      this.scene = null; this.st = {}; this.t = Math.random() * 100; this.fps = opts.fps || 30;
    }
    setScene(s) { this.scene = s; this.st = {}; this.ready = false; }
    resize(w, h, dpr = 1) {
      this.w = w; this.h = h; this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr); this.cv.style.width = w + 'px'; this.cv.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const c = Math.ceil(w / this.cw), r = Math.ceil(h / this.chh);
      this.buf = new Buf(c, r); this.buf.cw = this.cw; this.buf.chh = this.chh; this.ready = false;
    }
    frame(dt) {
      const s = this.scene; if (!s || !this.buf) return;
      if (!this.ready) { s.init(this.st, this.buf.c, this.buf.r); this.ready = true; }
      const mood = this.mood || 0; dt *= 1 + mood * 0.6;
      this.t += dt; const b = this.buf; b.clear(); s.draw(b, this.t, this.st);
      const ctx = this.ctx; const g = ctx.createLinearGradient(0, 0, 0, this.h); g.addColorStop(0, s.bg[0]); g.addColorStop(1, s.bg[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, this.w, this.h);
      if (s.under) { try { s.under(ctx, this.w, this.h, this.t, this.st); } catch (e) {} }
      if (Math.abs(mood) > 0.05) { const m2 = ctx.createRadialGradient(this.w / 2, this.h, 0, this.w / 2, this.h, Math.max(this.w, this.h)); const col = mood > 0 ? '40,230,120' : '255,60,80'; m2.addColorStop(0, `rgba(${col},${0.32 * Math.abs(mood)})`); m2.addColorStop(1, `rgba(${col},${0.1 * Math.abs(mood)})`); ctx.fillStyle = m2; ctx.fillRect(0, 0, this.w, this.h); }
      ctx.font = this.font; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      const groups = s.pal.map(() => []);
      for (let i = 0, n = b.ch.length; i < n; i++) if (b.ch[i]) groups[b.pc[i]] && groups[b.pc[i]].push(i);
      for (let p = 0; p < groups.length; p++) {
        const G = groups[p]; if (!G.length) continue; ctx.fillStyle = s.pal[p]; ctx.shadowColor = s.pal[p]; ctx.shadowBlur = this.glow ? this.glow : 0;
        for (const i of G) ctx.fillText(b.ch[i], (i % b.c) * this.cw, ((i / b.c) | 0) * this.chh);
      }
      if (s.over) { ctx.shadowBlur = 0; try { s.over(ctx, this.w, this.h, this.t, this.st); } catch (e) {} }
    }
  }

  window.XOT = { scenes, Renderer, makeScene };
})();

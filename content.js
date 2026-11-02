// XO Themes – content script
(() => {
  if (window.__xotLoaded) return; window.__xotLoaded = true;
  const { scenes, Renderer, makeScene } = window.XOT;
  const asset = p => chrome.runtime.getURL(p);
  const DEF = { theme: 'koi', deek: true, strength: 1, glass: true, deekSize: 112, ui: true, outfit: 'auto', streakFx: true, comments: true, friend: false, sounds: false, mood: true, pnl: true, confetti: true, autoTime: false, dayTheme: 'clouds', nightTheme: 'moon', perPage: {}, made: [], focus: false, _ts: 0 };
  const registerMade = () => { for (const m of S.made || []) if (!scenes.find(x => x.id === 'm:' + m.id)) scenes.push(makeScene(m)); };
  const pageKey = () => (location.pathname.split('/')[1] || 'markets').toLowerCase();
  const effTheme = () => {
    if (S.focus) return 'off';
    const pp = S.perPage && S.perPage[pageKey()]; if (pp) return pp;
    if (S.autoTime) { const h = new Date().getHours(); return h >= 7 && h < 19 ? S.dayTheme : S.nightTheme; }
    return S.theme;
  };
  let CUR = 'off';
  let S = { ...DEF };

  // ---------- wallpaper ----------
  const cv = document.createElement('canvas'); cv.id = 'xot-bg';
  const R = new Renderer(cv);
  let raf = 0, last = 0, acc = 0;
  const tick = now => {
    raf = requestAnimationFrame(tick);
    if (document.hidden) return;
    const dt = Math.min(100, now - (last || now)); last = now; acc += dt;
    if (acc < 1000 / 30) return; const step = acc / 1000; acc = 0; R.frame(step);
  };
  const size = () => R.resize(innerWidth, innerHeight, Math.min(2, devicePixelRatio || 1));
  addEventListener('resize', () => { if (cv.isConnected) size(); });

  // ---------- page styling: see-through backdrop, rounded tinted glass panels, smart text contrast, glowing charts ----------
  const touched = new Set();
  const ACCENT = { clouds: '#ffb347', koi: '#ff7b2e', jelly: '#ff7fd1', boats: '#ff7a59', fireflies: '#c8ff4d', moon: '#ffe9a3', xorain: '#d7f25b', xocandy: '#8f7dff', koiblue: '#3fa9ff' };
  // v1.6: per-theme glass tint (Blue Koi Pond uses Decibel's blue glass: tint, alpha, panel decoration)
  const GLASS_TINT = { koiblue: { t: [6, 26, 66], a: 0.5, deco: 'radial-gradient(110% 80% at 0% 0%, rgba(63,169,255,.26), transparent 60%), radial-gradient(80% 60% at 100% 100%, rgba(120,210,255,.14), transparent 60%), repeating-radial-gradient(circle at 30% 70%, rgba(160,220,255,.05) 0 1px, transparent 1px 24px)' } };
  let customDark = false;
  const curDark = () => { const sc = scenes.find(s => s.id === CUR); return sc ? !!sc.dark : customDark; };
  const accent = () => ACCENT[CUR] || (scenes.find(x => x.id === CUR) || {}).pal?.[1] || '#d7f25b';
  const _cc = new Map(); let _cx = null;
  const parseRGBA = str => {
    if (!str || str === 'transparent' || str === 'none') return null;
    const m = str.match(/^rgba?\(([^)]+)\)$/);
    if (m) { const p = m[1].split(/[ ,/]+/).filter(Boolean).map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; }
    // oklab / oklch / color(): let the browser convert it
    if (_cc.has(str)) return _cc.get(str);
    if (!_cx) { const c = document.createElement('canvas'); c.width = c.height = 1; _cx = c.getContext('2d', { willReadFrequently: true }); }
    _cx.clearRect(0, 0, 1, 1); _cx.fillStyle = '#000'; _cx.fillStyle = str; _cx.fillRect(0, 0, 1, 1);
    const d = _cx.getImageData(0, 0, 1, 1).data; const out = d[3] === 0 ? { r: 0, g: 0, b: 0, a: 0 } : { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
    if (_cc.size > 500) _cc.clear(); _cc.set(str, out); return out;
  };
  const lum = c => (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
  const ours = el => el.closest && el.closest('#xot-ui-host, #xot-deek-layer, #xot-bg, #xot-media');
  const setP = (el, k, v) => { const key = 'xo' + k.replace(/[^a-z]/gi, ''); if (!(key in el.dataset)) el.dataset[key] = el.style.getPropertyValue(k) || '\u0000'; el.style.setProperty(k, v, 'important'); touched.add(el); };
  function restoreBackdrops() {
    for (const el of touched) {
      for (const k of Object.keys(el.dataset)) if (k.startsWith('xo') && k !== 'xotBg') {
        const prop = { xobackgroundcolor: 'background-color', xobackgroundimage: 'background-image', xobackdropfilter: 'backdrop-filter', xowebkitbackdropfilter: '-webkit-backdrop-filter', xoborderradius: 'border-radius', xoboxshadow: 'box-shadow', xocolor: 'color', xowebkittextfillcolor: '-webkit-text-fill-color', xotextshadow: 'text-shadow', xofilter: 'filter' }[k.toLowerCase()];
        if (prop) { const v = el.dataset[k]; if (v === '\u0000') el.style.removeProperty(prop); else el.style.setProperty(prop, v); }
        delete el.dataset[k];
      }
      el.classList.remove('xot-glow', 'xot-chartbox');
    }
    touched.clear();
  }
  const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  function styleBackdrops() {
    if (CUR === 'off' || !document.body) return;
    const vw = innerWidth, vh = innerHeight, dark = curDark(), acc = accent();
    document.documentElement.style.setProperty('--xot-accent', acc);
    const all = document.body.getElementsByTagName('*'); const N = Math.min(all.length, 6000);
    const painted = new Map(); // el -> 'clear' | 'glass' | 'solid'
    if (!window.__xotPageBg && document.readyState !== 'loading') { const H = document.documentElement, had = H.classList.contains('xot-on'); H.classList.remove('xot-on'); const sv = [document.body, H].map(e => [e, e.style.getPropertyValue('background-color'), e.style.getPropertyPriority('background-color')]); sv.forEach(([e]) => e.style.removeProperty('background-color')); for (const el of [document.body, H]) { const c0 = parseRGBA(getComputedStyle(el).backgroundColor); if (c0 && c0.a > 0.5) { window.__xotPageBg = c0; break; } } sv.forEach(([e, v, p]) => v && e.style.setProperty('background-color', v, p)); if (had) H.classList.add('xot-on'); }
    if (false) { for (const el of [document.body, document.documentElement]) { const c0 = parseRGBA(getComputedStyle(el).backgroundColor); if (c0 && c0.a > 0.5) { window.__xotPageBg = c0; break; } } }
    for (const el of [document.documentElement, document.body]) { const c = parseRGBA(getComputedStyle(el).backgroundColor); if (c && c.a > 0.05 && !el.dataset.xobackgroundcolor) setP(el, 'background-color', 'transparent'); painted.set(el, 'clear'); }
    for (let i = 0; i < N; i++) {
      const el = all[i]; if (ours(el)) continue;
      if (el.dataset.xobackgroundcolor !== undefined) { painted.set(el, el.dataset.xoKind || 'glass'); continue; }
      const cs = getComputedStyle(el); const c = parseRGBA(cs.backgroundColor);
      if (!c || c.a < 0.05) continue;
      const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue;
      const fullBleed = r.width >= vw * 0.96 && r.height >= vh * 0.6 && cs.position !== 'fixed';
      if (fullBleed) { if (!window.__xotPageBg && c.a > 0.5) window.__xotPageBg = c; setP(el, 'background-color', 'transparent'); if (cs.backgroundImage !== 'none' && !/url\(/.test(cs.backgroundImage)) setP(el, 'background-image', 'none'); el.dataset.xoKind = 'clear'; painted.set(el, 'clear'); continue; }
      // panels: anything sizeable whose parent paint is the wallpaper
      let p = el.parentElement, under = 'clear';
      while (p && p !== document.documentElement) { if (painted.has(p)) { under = painted.get(p); break; } p = p.parentElement; }
      const panel = r.width > 120 && r.height > 36 && c.a > 0.5 && under === 'clear';
      if (!panel) {
        // an inner layer that fills a glass panel: round it with the panel so corners never look cut
        if (under === 'glass' && p && c.a > 0.5) { const pr = p.getBoundingClientRect(); if (r.width >= pr.width * 0.9 && r.height >= pr.height * 0.75 && parseFloat(cs.borderTopLeftRadius) < 6) { setP(el, 'border-radius', getComputedStyle(p).borderTopLeftRadius); setP(el, 'background-color', `rgba(${c.r},${c.g},${c.b},${curDark() ? 0.9 : 0.8})`); } }
        painted.set(el, 'solid'); continue;
      }
      if (S.glass) {
        let stacked = false; // carousel slides sit on top of each other: keep them solid so they never bleed through
        if (el.parentElement) for (const sib of el.parentElement.children) { if (sib === el) continue; const q = sib.getBoundingClientRect(); if (Math.abs(q.left - r.left) < 40 && Math.abs(q.top - r.top) < 40 && Math.abs(q.width - r.width) < 40 && q.height > 40) { stacked = true; break; } }
        if (!stacked && el.parentElement && /absolute|fixed/.test(getComputedStyle(el.parentElement).position + cs.position) && el.closest('[aria-roledescription=carousel], [class*=carousel], [class*=embla], [class*=swiper], [class*=slide]')) stacked = true;
        const a = stacked ? 1 : dark ? 0.9 : 0.8;
        const gt = GLASS_TINT[CUR];
        if (gt && !stacked) { el.dataset.xoTint = '1'; setP(el, 'background-color', `rgba(${gt.t[0]},${gt.t[1]},${gt.t[2]},${gt.a})`); if (cs.backgroundImage === 'none') setP(el, 'background-image', gt.deco); }
        else setP(el, 'background-color', `rgba(${c.r},${c.g},${c.b},${a})`);
        setP(el, 'backdrop-filter', 'blur(14px) saturate(1.3)'); setP(el, '-webkit-backdrop-filter', 'blur(14px) saturate(1.3)');
      }
      const full = r.width >= vw * 0.9;
      if (!full && parseFloat(cs.borderTopLeftRadius) < 6) setP(el, 'border-radius', '16px');
      if (!full) setP(el, 'box-shadow', `0 0 0 1px ${hexA(acc, dark ? 0.45 : 0.55)}, 0 10px 30px ${dark ? 'rgba(0,0,0,.35)' : hexA(acc, 0.18)}${cs.boxShadow !== 'none' ? ', ' + cs.boxShadow : ''}`);
      el.dataset.xoKind = 'glass'; painted.set(el, 'glass');
    }
    // list rows that alternate solid / see-through: give the see-through ones the same glass so every row reads
    for (const el of [...touched]) {
      if (el.dataset.xoKind !== 'glass' || !el.parentElement) continue;
      const r = el.getBoundingClientRect(), bg = getComputedStyle(el).backgroundColor;
      for (const sib of el.parentElement.children) {
        if (sib === el || sib.dataset.xoKind || ours(sib) || sib.tagName !== el.tagName) continue;
        const sr = sib.getBoundingClientRect(); if (Math.abs(sr.width - r.width) > r.width * 0.06 || sr.height < 20) continue;
        const sc = parseRGBA(getComputedStyle(sib).backgroundColor); if (sc && sc.a > 0.3) continue;
        setP(sib, 'background-color', bg); setP(sib, 'backdrop-filter', 'blur(14px) saturate(1.3)'); setP(sib, '-webkit-backdrop-filter', 'blur(14px) saturate(1.3)');
        setP(sib, 'border-radius', getComputedStyle(el).borderTopLeftRadius); setP(sib, 'box-shadow', getComputedStyle(el).boxShadow);
        sib.dataset.xoKind = 'glass'; painted.set(sib, 'glass');
      }
    }
    // text sitting straight on the wallpaper: flip it to contrast with the theme
    const cssReady = document.readyState !== 'loading' && document.styleSheets.length > 0;
    for (let i = 0; cssReady && i < N; i++) {
      const el = all[i]; if (ours(el)) continue;
      if (el.dataset.xocolor !== undefined || el.dataset.xotextshadow !== undefined) {
        // re-check: if a card now sits behind this text, give it back its own colours
        let q = el.parentElement, onPanel = false; while (q && q !== document.documentElement) { const qc = parseRGBA(getComputedStyle(q).backgroundColor); if (qc && qc.a >= 0.45) { onPanel = true; break; } q = q.parentElement; }
        if (onPanel && q.dataset && q.dataset.xoTint && GLASS_TINT[CUR]) continue; // v1.6: text kept light on blue-tinted glass
        if (onPanel) for (const [k, prop] of [['xocolor', 'color'], ['xotextshadow', 'text-shadow'], ['xowebkittextfillcolor', '-webkit-text-fill-color']]) if (el.dataset[k] !== undefined) { const v = el.dataset[k]; if (v === '\u0000') el.style.removeProperty(prop); else el.style.setProperty(prop, v); delete el.dataset[k]; }
        continue;
      }
      let hasText = !!el.shadowRoot && el.getBoundingClientRect().height > 8; // e.g. animated number widgets render their digits in a shadow root
      if (!hasText) for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { hasText = true; break; }
      if (!hasText) continue;
      let p = el, under = 'clear';
      while (p && p !== document.documentElement) { const pc = parseRGBA(getComputedStyle(p).backgroundColor); if (pc && pc.a >= 0.45) { under = 'panel'; break; } p = p.parentElement; }
      if (under !== 'clear') {
        // v1.6: neutral dark text on a blue-tinted glass panel (Blue Koi Pond) is flipped light so it stays readable
        if (GLASS_TINT[CUR] && p.dataset && p.dataset.xoTint) { const tc = parseRGBA(getComputedStyle(el).color); if (tc && lum(tc) < 0.6 && Math.max(tc.r, tc.g, tc.b) - Math.min(tc.r, tc.g, tc.b) < 60) { setP(el, 'color', '#eaf4ff'); setP(el, '-webkit-text-fill-color', '#eaf4ff'); setP(el, 'text-shadow', '0 1px 2px rgba(0,10,40,.8)'); } }
        continue;
      }
      let fx = el, pinned = false; while (fx && fx !== document.body) { const ps = getComputedStyle(fx).position; if (ps === 'fixed' || ps === 'sticky') { const pr = fx.getBoundingClientRect(); if (pr.top < 90 && pr.height < 130) pinned = true; break; } fx = fx.parentElement; }
      if (pinned) continue;
      // tab bars, filter rows, buttons: put the whole row on a frosted strip in the page's own colour, so the site's own text and tab pills look exactly as designed
      let bar = null, up = el;
      while (up && up !== document.body) { const ur = up.getBoundingClientRect(); if (ur.width > vw * 0.92 || ur.height > 140) break; if (up !== el) { const uc = parseRGBA(getComputedStyle(up).backgroundColor); if (uc && uc.a >= 0.45) break; } bar = up; up = up.parentElement; }
      const interactive = bar && (bar.matches('button, [role=tab], [role=tablist]') || bar.querySelector('button, [role=tab], input, select'));
      if (bar && interactive && !bar.dataset.xoKind) {
        const pb = window.__xotPageBg || { r: 244, g: 244, b: 246 }; const col = `rgba(${pb.r},${pb.g},${pb.b},.88)`;
        setP(bar, 'background-color', col); setP(bar, 'backdrop-filter', 'blur(14px) saturate(1.3)'); setP(bar, '-webkit-backdrop-filter', 'blur(14px) saturate(1.3)');
        setP(bar, 'border-radius', '14px'); setP(bar, 'box-shadow', `0 0 0 8px ${col}, 0 0 0 9px ${hexA(acc, 0.5)}, 0 8px 26px 8px rgba(0,0,0,.18)`);
        bar.dataset.xoKind = 'glass'; painted.set(bar, 'glass'); continue;
      }
      const c = parseRGBA(getComputedStyle(el).color); if (!c) continue; const L = lum(c);
      if (dark && L < 0.6) { setP(el, 'color', '#f4f1ff'); setP(el, '-webkit-text-fill-color', '#f4f1ff'); setP(el, 'text-shadow', '0 0 6px rgba(0,0,0,.95), 0 1px 2px rgba(0,0,0,.9)'); }
      else if (!dark && L > 0.55) { setP(el, 'color', '#1a1033'); setP(el, '-webkit-text-fill-color', '#1a1033'); setP(el, 'text-shadow', '0 0 6px rgba(255,255,255,.95), 0 0 2px rgba(255,255,255,.9)'); }
      else setP(el, 'text-shadow', dark ? '0 0 6px rgba(0,0,0,.95), 0 1px 2px rgba(0,0,0,.9)' : '0 0 6px rgba(255,255,255,.95), 0 0 2px rgba(255,255,255,.9)');
    }
    // charts: glowing pulse lines in the theme colour
    for (const sv of document.body.querySelectorAll('svg, canvas')) {
      if (ours(sv) || sv.dataset.xoChart) continue; const r = sv.getBoundingClientRect(); if (r.width < 240 || r.height < 110) continue;
      if (sv.tagName !== 'CANVAS') { // only real line charts, not big icons or illustrations
        let ok = false; for (const pth of sv.querySelectorAll('path, polyline')) { const cs2 = getComputedStyle(pth); if (cs2.stroke === 'none' || !pth.getTotalLength) continue; const d = pth.getAttribute('d') || pth.getAttribute('points') || ''; if ((d.match(/[LlCc,]/g) || []).length > 20 && pth.getTotalLength() > r.width * 0.7) { ok = true; break; } }
        if (!ok) { sv.dataset.xoChart = '0'; continue; }
      }
      sv.dataset.xoChart = '1'; touched.add(sv);
      // give the chart its own frosted card so the wallpaper never runs through the lines
      let box = sv, up = sv.parentElement;
      while (up && up !== document.body) { const ur = up.getBoundingClientRect(); if (ur.width > r.width + 80 || ur.height > r.height + 280) break; box = up; up = up.parentElement; }
      let anc = box, onWall = true; while (anc && anc !== document.body) { if (anc !== box && anc.dataset && anc.dataset.xoKind === 'glass') { onWall = false; break; } const bc = parseRGBA(getComputedStyle(anc).backgroundColor); if (anc !== box && bc && bc.a > 0.5 && !anc.dataset.xobackgroundcolor) { onWall = false; break; } anc = anc.parentElement; }
      if (onWall && box.dataset.xoKind !== 'glass') {
        setP(box, 'background-color', `rgba(${(window.__xotPageBg||{r:255}).r},${(window.__xotPageBg||{g:255}).g},${(window.__xotPageBg||{b:255}).b},.86)`);
        setP(box, 'backdrop-filter', 'blur(16px) saturate(1.3)'); setP(box, '-webkit-backdrop-filter', 'blur(16px) saturate(1.3)');
        const pb2 = window.__xotPageBg || { r: 255, g: 255, b: 255 }; const tint = `rgba(${pb2.r},${pb2.g},${pb2.b},.86)`; setP(box, 'border-radius', '14px'); setP(box, 'box-shadow', `0 0 0 12px ${tint}, 0 0 0 13px ${hexA(acc, 0.55)}, 0 0 34px 12px ${hexA(acc, dark ? 0.2 : 0.16)}`);
        box.dataset.xoKind = 'glass'; box.classList.add('xot-chartbox');
      }
      if (sv.tagName === 'CANVAS') { setP(sv, 'filter', `drop-shadow(0 0 3px ${hexA(acc, 0.8)})`); continue; }
      for (const pth of sv.querySelectorAll('path, polyline, line')) {
        const cs = getComputedStyle(pth); const w = parseFloat(cs.strokeWidth) || 0;
        if (cs.stroke && cs.stroke !== 'none' && w >= 1.4 && !cs.strokeDasharray.match(/\d/) && (pth.getTotalLength ? pth.getTotalLength() > 150 : true)) { pth.classList.add('xot-glow'); touched.add(pth); }
      }
    }
  }
  const clearBackdrops = styleBackdrops;
  let mo, moT = 0, lastRun = 0;
  // throttle (not debounce): restyle at most every 250ms, first pass almost instantly
  function schedule(wait) {
    if (moT) return; const gap = wait != null ? wait : Math.max(16, 250 - (performance.now() - lastRun));
    moT = setTimeout(() => { moT = 0; lastRun = performance.now(); if (CUR !== 'off') { try { styleBackdrops(); } catch (e) {} } }, gap);
  }
  const recheck = () => { if (typeof applyTheme === 'function' && effTheme() !== CUR) applyTheme(); };
  const burst = () => { setTimeout(recheck, 0); setTimeout(recheck, 120); [0, 80, 250, 600, 1200].forEach(t => setTimeout(() => schedule(0), t)); };
  setInterval(recheck, 30000); let _lp = location.pathname; setInterval(() => { if (location.pathname !== _lp) { _lp = location.pathname; burst(); } }, 300);
  addEventListener('popstate', burst); try { window.navigation && navigation.addEventListener('navigate', burst); } catch (e) {}
  document.addEventListener('DOMContentLoaded', burst); addEventListener('load', burst);
  // ---------- custom uploaded wallpapers (image / gif / video) ----------
  let media = null, mediaURL = null, mediaFor = null;
  const getCustoms = () => new Promise(r => chrome.storage.local.get('xotCustoms', o => r(o.xotCustoms || [])));
  const getBlob = id => new Promise(r => chrome.storage.local.get('xotc_' + id, o => r(o['xotc_' + id] || null)));
  const dataToBlobURL = d => { const [h, b64] = d.split(','); const mime = h.slice(5).split(';')[0]; const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return URL.createObjectURL(new Blob([u], { type: mime })); };
  function dropMedia() { if (media) media.remove(); if (mediaURL) URL.revokeObjectURL(mediaURL); media = null; mediaURL = null; mediaFor = null; }
  async function showCustom(id) {
    const list = await getCustoms(); const meta = list.find(c => c.id === id); if (!meta) { S.theme = 'off'; save(); return; }
    if (mediaFor !== id) {
      dropMedia(); const data = await getBlob(id); if (!data || CUR !== 'c:' + id) return;
      mediaURL = dataToBlobURL(data); mediaFor = id;
      if (meta.kind === 'video') { media = document.createElement('video'); Object.assign(media, { autoplay: true, loop: true, muted: true, playsInline: true }); media.setAttribute('muted', ''); media.src = mediaURL; media.play().catch(() => {}); }
      else { media = document.createElement('img'); media.src = mediaURL; media.alt = ''; }
      media.id = 'xot-media'; document.documentElement.prepend(media);
    }
    media.style.opacity = S.strength;
    document.documentElement.classList.toggle('xot-dark', !!meta.dark);
    if (customDark !== !!meta.dark) { customDark = !!meta.dark; restoreBackdrops(); styleBackdrops(); }
  }
  function applyTheme() {
    registerMade(); CUR = effTheme(); document.documentElement.classList.toggle('xot-focus', !!S.focus);
    const custom = CUR && CUR.startsWith('c:');
    const sc = scenes.find(s => s.id === CUR);
    if (!custom) dropMedia();
    if (!sc) { cancelAnimationFrame(raf); raf = 0; cv.remove(); }
    if (!sc && !custom) { restoreBackdrops(); document.documentElement.classList.remove('xot-on', 'xot-dark'); if (mo) mo.disconnect(); return; }
    document.documentElement.classList.add('xot-on');
    if (sc) {
      if (!cv.isConnected) { document.documentElement.prepend(cv); size(); }
      R.setScene(sc); cv.style.opacity = S.strength;
      document.documentElement.classList.toggle('xot-dark', !!sc.dark);
      if (!raf) raf = requestAnimationFrame(tick);
    } else showCustom(CUR.slice(2));
    restoreBackdrops(); clearBackdrops();
    if (!mo) mo = new MutationObserver(recs => {
      // price ticks only swap text; skip those so the page stays smooth
      let real = false; for (const r of recs) { for (const n of r.addedNodes) if (n.nodeType === 1 && !ours(n)) { real = true; break; } if (real) break; }
      if (!real) return;
      // observers run before the browser paints, so styling here means the new page never flashes white
      if (performance.now() - lastRun > 250 && CUR !== 'off') { lastRun = performance.now(); try { styleBackdrops(); } catch (e) {} }
      schedule();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    schedule(0);
  }

  // read a file, make a thumbnail + brightness guess, save it
  async function addCustom(file) {
    const kind = file.type.startsWith('video/') ? 'video' : 'image';
    if (file.size > 80 * 1024 * 1024) { toast('That file is over 80 MB, try a smaller one'); return; }
    toast('Saving your theme…');
    const data = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
    const url = URL.createObjectURL(file);
    const el = kind === 'video' ? Object.assign(document.createElement('video'), { muted: true, src: url, playsInline: true }) : Object.assign(new Image(), { src: url });
    await new Promise(r => { if (kind === 'video') { el.onloadeddata = () => { el.currentTime = Math.min(1, (el.duration || 2) / 3); }; el.onseeked = r; el.onerror = r; } else { el.onload = r; el.onerror = r; } setTimeout(r, 4000); });
    const c = document.createElement('canvas'); c.width = 240; c.height = 116; const x = c.getContext('2d');
    let dark = false, thumb = '';
    try {
      const w = el.videoWidth || el.naturalWidth || 240, h = el.videoHeight || el.naturalHeight || 116; const sc = Math.max(240 / w, 116 / h);
      x.drawImage(el, (240 - w * sc) / 2, (116 - h * sc) / 2, w * sc, h * sc); thumb = c.toDataURL('image/jpeg', 0.75);
      const px = x.getImageData(0, 0, 240, 116).data; let L = 0; for (let i = 0; i < px.length; i += 16) L += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]; dark = L / (px.length / 16) < 110;
    } catch (e) {}
    URL.revokeObjectURL(url);
    const id = Date.now().toString(36);
    const list = await getCustoms(); list.push({ id, name: (file.name || 'My theme').replace(/\.[^.]+$/, '').slice(0, 18), kind, dark, thumb });
    await new Promise(r => chrome.storage.local.set({ ['xotc_' + id]: data, xotCustoms: list }, r));
    if (chrome.runtime.lastError) { toast('Could not save, file too big'); return; }
    S.theme = 'c:' + id; save(); buildGrid(); toast('Saved ✓');
  }
  async function deleteCustom(id) {
    const list = (await getCustoms()).filter(c => c.id !== id);
    await new Promise(r => chrome.storage.local.set({ xotCustoms: list }, r)); chrome.storage.local.remove('xotc_' + id);
    if (S.theme === 'c:' + id) { S.theme = 'koi'; save(); }
    buildGrid();
  }

  // ---------- Deek ----------
  let deek = null;
  function applyDeek() {
    if (S.deek && !deek) { deek = new window.XOTDeek({ url: p => asset(`deek/${p}.webp`), size: S.deekSize, onEvent: (ev, a) => onDeekEvent(ev, a) }); deek.mount(); if (typeof ST !== 'undefined') deek.setStreak(S.streakFx ? ST.streak : 0); }
    else if (!S.deek && deek) { deek.unmount(); deek = null; }
    if (deek) { deek.setSize(S.deekSize); if (deek._of !== S.outfit) { deek._of = S.outfit; deek.setOutfit(S.outfit); } deek.comments = S.comments; deek.setFriend(S.friend && !S.focus); if (typeof ST !== 'undefined') deek.setStreak(S.streakFx ? ST.streak : 0); }
    if (deek) deek.layer.style.display = S.focus ? 'none' : '';
  }

  // ---------- theme bar (in-page, shadow DOM) ----------
  const host = document.createElement('div'); host.id = 'xot-ui-host';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
  <style>
    :host{all:initial}
    *{box-sizing:border-box;font-family:Figtree,Rubik,ui-sans-serif,system-ui,sans-serif}
    .pill{position:fixed;right:16px;bottom:16px;z-index:2147483646;display:flex;align-items:center;gap:8px;padding:8px 12px 8px 8px;border-radius:999px;background:rgba(20,14,40,.82);color:#fff;font-size:13px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,.14);box-shadow:0 8px 24px rgba(0,0,0,.25);backdrop-filter:blur(10px);user-select:none;transition:transform .15s}
    .pill:hover{transform:translateY(-2px)}
    .pill img{width:24px;height:24px;border-radius:50%;background:#d7f25b;object-fit:cover;object-position:50% 8%}
    .panel{position:fixed;right:16px;bottom:64px;z-index:2147483646;width:min(640px,calc(100vw - 32px));padding:14px;border-radius:18px;background:rgba(18,12,36,.9);color:#fff;border:1px solid rgba(255,255,255,.12);box-shadow:0 20px 50px rgba(0,0,0,.35);backdrop-filter:blur(14px);transform-origin:bottom right;transition:opacity .18s,transform .18s}
    .panel.hide{opacity:0;transform:translateY(8px) scale(.98);pointer-events:none}
    .row{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
    .title{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#cbbfff;font-weight:800}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}
    .t{border-radius:12px;overflow:hidden;cursor:pointer;border:2px solid transparent;background:#000;position:relative;transition:transform .12s,border-color .12s}
    .t:hover{transform:translateY(-2px)}
    .t.on{border-color:#d7f25b}
    .t canvas{display:block;width:100%;height:58px}
    .t span{display:block;font-size:11px;font-weight:700;padding:5px 6px;background:rgba(0,0,0,.55);color:#fff;white-space:nowrap}
    .t.off{display:flex;flex-direction:column;justify-content:flex-end;background:repeating-linear-gradient(45deg,#2a2342,#2a2342 6px,#221c38 6px,#221c38 12px)}
    .t.off .x{flex:1;display:flex;align-items:center;justify-content:center;font-size:22px;color:#8f86b8}
    .opts{display:flex;flex-wrap:wrap;gap:14px;margin-top:12px;font-size:12px;color:#ddd6ff;align-items:center}
    label{display:flex;align-items:center;gap:6px;cursor:pointer}
    input[type=range]{accent-color:#d7f25b;width:90px}
    input[type=checkbox]{accent-color:#d7f25b}
    button{all:unset;cursor:pointer;padding:6px 10px;border-radius:999px;background:#d7f25b;color:#1a1033;font-weight:800;font-size:12px}
    .close{background:transparent;color:#cbbfff;padding:2px 6px;font-size:16px}
    .t.cu .th{height:58px;background-size:cover;background-position:center}
    .t.cu .del{position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;font-size:11px;display:none;align-items:center;justify-content:center}
    .t.cu:hover .del{display:flex}
    .t.cu .tag{position:absolute;top:4px;left:4px;font-style:normal;font-size:9px;font-weight:800;padding:2px 5px;border-radius:6px;background:#d7f25b;color:#1a1033}
    .t.up{display:flex;flex-direction:column;justify-content:flex-end;background:#221a3d;border:2px dashed #5b4f8f}
    .t.up .x{flex:1;display:flex;align-items:center;justify-content:center;font-size:24px;color:#d7f25b}
    .toast{position:fixed;right:16px;bottom:120px;z-index:2147483647;padding:8px 12px;border-radius:10px;background:#d7f25b;color:#1a1033;font-weight:800;font-size:12px;opacity:0;transition:opacity .2s;pointer-events:none}
    .toast.on{opacity:1}
    .panel{max-height:calc(100vh - 90px);overflow:auto}
    .sec{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08);font-size:12px;color:#ddd6ff}
    .sec .title{width:100%;font-size:11px}
    select,#mkName{all:unset;background:#2a2147;color:#fff;border-radius:8px;padding:4px 8px;font-size:12px;border:1px solid rgba(255,255,255,.12);cursor:pointer}
    #mkName{cursor:text;width:90px}
    input[type=color]{width:28px;height:22px;border:none;background:none;padding:0;cursor:pointer}
    .hint{margin-top:10px;font-size:10.5px;color:#8f86b8}
    button.on{background:#ff5fb7;color:#fff}
    .pnl{position:fixed;left:16px;bottom:16px;z-index:2147483645;display:flex;gap:12px;align-items:center;padding:8px 14px;border-radius:14px;background:rgba(20,14,40,.82);color:#fff;font-size:12px;font-weight:700;border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,.25)}
    .pnl b{font-size:14px}.pnl .w{color:#7dff9b}.pnl .l{color:#ff7b8a}.pnl .n{color:#d7f25b}
    .pnl .r{all:unset;cursor:pointer;color:#8f86b8;font-size:11px}
  </style>
  <div class="pill" id="pill"><img alt="" src="${asset('deek/front.webp')}"><span>XO Themes</span></div>
  <div class="panel hide" id="panel">
    <div class="row"><span class="title">Live wallpapers</span><button class="close" id="x">✕</button></div>
    <div class="grid" id="grid"></div><input type="file" id="file" accept="image/*,video/*" hidden>
    <div class="opts">
      <label><input type="checkbox" id="deek"> Deek</label>
      <label>Size <input type="range" id="dsize" min="70" max="170" step="2"></label>
      <label><input type="checkbox" id="glass"> Glass cards</label>
      <label>Wallpaper <input type="range" id="str" min="0.25" max="1" step="0.05"></label>
      <button id="call">Call Deek</button>
    </div>
    <div class="sec"><span class="title">Deek</span>
      <label>Outfit <select id="outfit"><option value="auto">Auto (by date)</option><option value="none">None</option><option value="halloween">Halloween</option><option value="santa">Christmas</option><option value="trader">Trader suit</option><option value="hoodie">XO hoodie</option></select></label>
      <label><input type="checkbox" id="streakFx"> Streak mood</label>
      <label><input type="checkbox" id="comments"> Commentary</label>
      <label><input type="checkbox" id="friend"> Buddy chick</label>
      <button id="feed">🌽 Feed</button><button id="pet">❤️ Pet</button>
    </div>
    <div class="sec"><span class="title">Pulse</span>
      <label><input type="checkbox" id="mood"> Theme reacts to market</label>
      <label><input type="checkbox" id="confetti"> Win confetti</label>
      <label><input type="checkbox" id="sounds"> Countdown sounds</label>
      <label><input type="checkbox" id="pnl"> PnL tracker</label>
    </div>
    <div class="sec"><span class="title">Schedule</span>
      <label><input type="checkbox" id="autoTime"> Auto day/night</label>
      <label>Day <select id="dayTheme" class="ts"></select></label>
      <label>Night <select id="nightTheme" class="ts"></select></label>
      <label id="ppl">This page <select id="perPage" class="ts"></select></label>
      <button id="focus">Focus mode</button>
    </div>
    <div class="sec"><span class="title">Theme maker</span>
      <input id="mkName" placeholder="Name" maxlength="18">
      <label>Base <input type="color" id="mkC1" value="#140a2e"></label>
      <label>Glow <input type="color" id="mkC2" value="#d7f25b"></label>
      <label>Motion <select id="mkStyle"><option value="stars">Twinkle</option><option value="rain">Rain</option><option value="waves">Waves</option><option value="bubbles">Bubbles</option></select></label>
      <button id="mkGo">Create</button>
    </div>
    <div class="hint">Alt+T panel · Alt+F focus · Alt+1–9 themes · Alt+Shift+T hide bar · Shift-click Deek to feed, Alt-click to pet</div>
  </div><div class="toast" id="toast"></div><div class="pnl" id="pnlBox" style="display:none"><span>Today</span><span class="w">W <b id="pw">0</b></span><span class="l">L <b id="pl">0</b></span><span>Win <b id="pr">–</b></span><span class="n">Net <b id="pn">–</b></span><span>Streak <b id="ps">0</b></span><button class="r" id="preset" title="Reset today">↺</button></div>`;
  const $ = id => root.getElementById(id);
  const save = () => { S._ts = Date.now(); const o = { ...S }; chrome.storage.local.set({ xot: o }); try { chrome.storage.sync.set({ xot: o }); } catch (e) {} applyAll(); };
  async function buildGrid() {
    const g = $('grid'); g.innerHTML = '';
    const off = document.createElement('div'); off.className = 't off'; off.dataset.id = 'off'; off.innerHTML = '<div class="x">✕</div><span>Off</span>'; off.onclick = () => pickTheme('off'); g.append(off);
    for (const sc of scenes) {
      const t = document.createElement('div'); t.className = 't'; t.dataset.id = sc.id;
      const c = document.createElement('canvas'); const span = document.createElement('span'); span.textContent = sc.name; t.append(c, span); g.append(t);
      const r = new Renderer(c, { cw: 4, ch: 6, font: '700 6px monospace' }); r.setScene(sc); r.resize(120, 58, 2); r.t = 6; for (let i = 0; i < 40; i++) r.frame(0.05);
      t.onclick = () => pickTheme(sc.id);
      if (sc.made) { const d = document.createElement('b'); d.className = 'del'; d.textContent = '✕'; d.title = 'Delete'; t.classList.add('cu'); t.append(d); d.onclick = e => { e.stopPropagation(); S.made = S.made.filter(m => 'm:' + m.id !== sc.id); const i = scenes.indexOf(sc); if (i >= 0) scenes.splice(i, 1); if (S.theme === sc.id) S.theme = 'koi'; save(); buildGrid(); }; }
    }
    for (const cu of await getCustoms()) {
      const t = document.createElement('div'); t.className = 't cu'; t.dataset.id = 'c:' + cu.id;
      t.innerHTML = `<div class="th"></div><span></span><b class="del" title="Delete">✕</b>${cu.kind === 'video' ? '<i class="tag">VIDEO</i>' : ''}`;
      t.querySelector('.th').style.backgroundImage = `url("${cu.thumb}")`; t.querySelector('span').textContent = cu.name;
      t.onclick = e => { if (e.target.classList.contains('del')) { if (confirm('Delete this theme?')) deleteCustom(cu.id); return; } pickTheme('c:' + cu.id); };
      g.append(t);
    }
    const up = document.createElement('div'); up.className = 't up'; up.innerHTML = '<div class="x">+</div><span>Upload</span>';
    up.onclick = () => $('file').click(); g.append(up);
    syncUI();
  }
  function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200); }
  function syncUI() {
    $('deek').checked = S.deek; $('glass').checked = S.glass; $('str').value = S.strength; $('dsize').value = S.deekSize;
    root.querySelectorAll('.t').forEach(t => t.classList.toggle('on', t.dataset.id === CUR || (CUR === 'off' && t.dataset.id === 'off')));
    syncExtra();
    host.style.display = S.ui ? '' : 'none';
  }
  $('pill').onclick = () => { const p = $('panel'); const open = p.classList.toggle('hide'); if (!open && !$('grid').children.length) buildGrid(); };
  $('x').onclick = () => $('panel').classList.add('hide');
  $('file').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) addCustom(f).catch(() => toast('Could not read that file')); };
  $('deek').onchange = e => { S.deek = e.target.checked; save(); };
  $('glass').onchange = e => { S.glass = e.target.checked; save(); };
  $('str').oninput = e => { S.strength = +e.target.value; cv.style.opacity = S.strength; if (media) media.style.opacity = S.strength; };
  $('str').onchange = save;
  $('dsize').oninput = e => { S.deekSize = +e.target.value; if (deek) deek.setSize(S.deekSize); };
  $('dsize').onchange = save;
  $('call').onclick = () => { if (!S.deek) { S.deek = true; save(); return; } if (deek) { deek.x = innerWidth / 2; deek.y = -40; deek.vx = 0; deek.vy = 0; deek.state = 'air'; deek.plat = null; deek.airPose = 'peace'; deek.say('you called? 🐓', 1800); } };
  addEventListener('keydown', e => { if (e.altKey && e.shiftKey && (e.key === 'T' || e.key === 't')) { S.ui = !S.ui; save(); } });


  // ---------- extras: theme picking, schedule, focus, theme maker ----------
  function pickTheme(id) {
    const pk = pageKey();
    if (S.perPage && S.perPage[pk]) { S.perPage = { ...S.perPage, [pk]: id === 'off' ? 'off' : id }; }
    else { S.theme = id; if (S.autoTime) { S.autoTime = false; toast('Auto day/night turned off'); } }
    if (S.focus) S.focus = false;
    save();
  }
  function themeOptions(sel, withDefault) {
    const cur = sel.value; sel.innerHTML = (withDefault ? '<option value="">Default</option>' : '') + '<option value="off">Off</option>' + scenes.map(x => `<option value="${x.id}">${x.name.replace(/</g, '')}</option>`).join('');
    sel.value = cur;
  }
  function syncExtra() {
    for (const k of ['streakFx', 'comments', 'friend', 'mood', 'confetti', 'sounds', 'pnl', 'autoTime']) $(k).checked = !!S[k];
    $('outfit').value = S.outfit;
    for (const id of ['dayTheme', 'nightTheme']) { themeOptions($(id)); $(id).value = S[id]; }
    themeOptions($('perPage'), true); $('perPage').value = (S.perPage || {})[pageKey()] || ''; $('ppl').firstChild.textContent = `On /${pageKey()} `;
    $('focus').classList.toggle('on', !!S.focus); $('focus').textContent = S.focus ? 'Focus ON' : 'Focus mode';
    renderPnl();
  }
  for (const k of ['streakFx', 'comments', 'friend', 'mood', 'confetti', 'sounds', 'pnl', 'autoTime']) $(k).onchange = e => { S[k] = e.target.checked; save(); if (k === 'sounds' && S.sounds) beep(880, 0.08, 0.05); };
  $('outfit').onchange = e => { S.outfit = e.target.value; save(); };
  $('dayTheme').onchange = e => { S.dayTheme = e.target.value; save(); };
  $('nightTheme').onchange = e => { S.nightTheme = e.target.value; save(); };
  $('perPage').onchange = e => { const pp = { ...(S.perPage || {}) }; if (e.target.value) pp[pageKey()] = e.target.value; else delete pp[pageKey()]; S.perPage = pp; save(); };
  const toggleFocus = () => { S.focus = !S.focus; save(); toast(S.focus ? 'Focus mode on (Alt+F to exit)' : 'Focus mode off'); };
  $('focus').onclick = toggleFocus;
  $('feed').onclick = () => deek && deek.feed(); $('pet').onclick = () => deek && deek.pet();
  $('mkGo').onclick = () => {
    const m = { id: Date.now().toString(36), name: ($('mkName').value || 'My theme').slice(0, 18), c1: $('mkC1').value, c2: $('mkC2').value, style: $('mkStyle').value };
    S.made = [...(S.made || []), m]; registerMade(); S.theme = 'm:' + m.id; S.autoTime = false; save(); buildGrid(); toast('Theme created ✓');
  };
  addEventListener('keydown', e => {
    if (!e.altKey || e.ctrlKey || e.metaKey) return; const tag = (document.activeElement && document.activeElement.tagName) || ''; if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    const k = e.key.toLowerCase();
    if (!e.shiftKey && k === 't') { e.preventDefault(); if (!S.ui) { S.ui = true; save(); } const p = $('panel'); const open = p.classList.toggle('hide'); if (!open && !$('grid').children.length) buildGrid(); }
    else if (!e.shiftKey && k === 'f') { e.preventDefault(); toggleFocus(); }
    else if (!e.shiftKey && /^[1-9]$/.test(e.key)) { const sc = scenes[+e.key - 1]; if (sc) { e.preventDefault(); pickTheme(sc.id); toast(sc.name); } }
  });

  // ---------- sounds (soft clock ticks + chimes, no pops) ----------
  let AC = null;
  function beep(f, dur, vol, type = 'sine', when = 0) {
    try { AC = AC || new AudioContext(); if (AC.state === 'suspended') AC.resume(); const t0 = AC.currentTime + when, o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + dur + 0.05); } catch (e) {}
  }
  const tickSnd = n => beep(n <= 1 ? 1320 : 990, 0.09, 0.05, 'triangle');
  const chimeWin = () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => beep(f, 0.5, 0.07, 'sine', i * 0.11));
  const chimeLose = () => [392, 329.63, 261.63].forEach((f, i) => beep(f, 0.55, 0.06, 'triangle', i * 0.16));

  // ---------- confetti + win card ----------
  function confetti() {
    const c = document.createElement('canvas'); c.id = 'xot-fx'; c.width = innerWidth; c.height = innerHeight; document.documentElement.append(c); const x = c.getContext('2d');
    const cols = [accent(), '#ff5fb7', '#ffd23f', '#7dff9b', '#8f7dff', '#ffffff'];
    const P = Array.from({ length: 180 }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 4, r: Math.random() * 6, s: 4 + Math.random() * 6, c: cols[(Math.random() * cols.length) | 0], ch: Math.random() < 0.25 ? '✦*+xo'[(Math.random() * 5) | 0] : '' }));
    const t0 = performance.now();
    const fr = now => { const k = now - t0; x.clearRect(0, 0, c.width, c.height); for (const p of P) { p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += 0.15; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.globalAlpha = Math.max(0, 1 - k / 3200); x.fillStyle = p.c; if (p.ch) { x.font = `900 ${p.s * 2.4}px monospace`; x.fillText(p.ch, 0, 0); } else x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); } if (k < 3200) requestAnimationFrame(fr); else c.remove(); };
    requestAnimationFrame(fr);
  }
  function winCard(net) {
    let w = document.getElementById('xot-win'); if (!w) { w = document.createElement('div'); w.id = 'xot-win'; document.documentElement.append(w); }
    w.innerHTML = `You won! 🏆<small>${net != null ? '+$' + net.toFixed(2) + ' (est.)' : 'Round won'}</small>`; requestAnimationFrame(() => w.classList.add('on'));
    clearTimeout(winCard.t); winCard.t = setTimeout(() => w.classList.remove('on'), 3200);
  }

  // ---------- PnL + streak tracking ----------
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  let ST = { day: today(), wins: 0, losses: 0, net: 0, netKnown: false, streak: 0 }, pending = null;
  chrome.storage.local.get('xotStats', o => { const v = o.xotStats; if (v) { ST = { ...ST, ...v }; if (ST.day !== today()) ST = { ...ST, day: today(), wins: 0, losses: 0, net: 0, netKnown: false }; } renderPnl(); if (deek) deek.setStreak(S.streakFx ? ST.streak : 0); });
  const saveStats = () => { chrome.storage.local.set({ xotStats: ST }); renderPnl(); };
  function renderPnl() {
    const box = $('pnlBox'); if (!box) return; const on = S.pnl && /\/pulse/.test(location.pathname) && S.ui && !S.focus; box.style.display = on ? 'flex' : 'none'; if (!on) return;
    $('pw').textContent = ST.wins; $('pl').textContent = ST.losses; const n = ST.wins + ST.losses; $('pr').textContent = n ? Math.round(ST.wins / n * 100) + '%' : '–';
    $('pn').textContent = ST.netKnown ? (ST.net >= 0 ? '+$' : '-$') + Math.abs(ST.net).toFixed(2) : '–'; $('ps').textContent = ST.streak > 0 ? '🔥' + ST.streak : ST.streak < 0 ? '☔' + -ST.streak : '0';
  }
  $('preset').onclick = () => { ST = { day: today(), wins: 0, losses: 0, net: 0, netKnown: false, streak: 0 }; saveStats(); if (deek) deek.setStreak(0); };
  setInterval(renderPnl, 1500);
  // read stake + share price when a Pulse bet is placed
  document.addEventListener('click', e => {
    if (!/\/pulse/.test(location.pathname)) return; const b = e.target.closest && e.target.closest('button'); if (!b || ours(b)) return;
    const t = b.textContent.replace(/\s+/g, ' ').trim(); if (!/^Buy\b/i.test(t) || b.disabled) return;
    const br = b.getBoundingClientRect(); let stake = null, best = 1e9;
    for (const inp of document.querySelectorAll('input')) { if (ours(inp)) continue; const v = parseFloat((inp.value || '').replace(/[^0-9.]/g, '')); if (!(v > 0)) continue; const r = inp.getBoundingClientRect(); if (!r.width) continue; const d = Math.hypot(r.left - br.left, r.top - br.top); if (d < best && d < 500) { best = d; stake = v; } }
    const pm = t.match(/(\d+(?:\.\d+)?)\s*¢/); const price = pm ? +pm[1] / 100 : null;
    pending = { stake, price, t: Date.now() };
  }, true);
  function onDeekEvent(ev, arg) {
    if (ev === 'tick') { if (S.sounds) tickSnd(arg); return; }
    if (ev === 'win' || ev === 'lose') {
      if (ST.day !== today()) ST = { ...ST, day: today(), wins: 0, losses: 0, net: 0, netKnown: false };
      let net = null; if (pending && pending.stake && Date.now() - pending.t < 10 * 60000) { net = ev === 'win' ? (pending.price ? pending.stake * (1 / pending.price - 1) : null) : -pending.stake; }
      if (ev === 'win') { ST.wins++; ST.streak = ST.streak > 0 ? ST.streak + 1 : 1; } else { ST.losses++; ST.streak = ST.streak < 0 ? ST.streak - 1 : -1; }
      if (net != null) { ST.net += net; ST.netKnown = true; } pending = null; saveStats();
      if (deek) deek.setStreak(S.streakFx ? ST.streak : 0);
      if (ev === 'win') { if (S.confetti) { confetti(); winCard(net); } if (S.sounds) chimeWin(); } else if (S.sounds) chimeLose();
    }
  }

  // ---------- market mood: wallpaper follows the Pulse price vs price to beat ----------
  let moodV = 0;
  setInterval(() => {
    let target = 0;
    if (S.mood && /\/pulse/.test(location.pathname) && cv.isConnected && !document.hidden) { try { const p = window.XOTDeek.probe(); if (p.h && p.by != null) target = Math.max(-1, Math.min(1, (p.by - p.h.y) / 70)); } catch (e) {} }
    const big = Math.abs(target - moodV) > 0.35; moodV += (target - moodV) * 0.35; R.mood = Math.abs(moodV) < 0.04 ? 0 : moodV; R.glow = CUR === 'fireflies' && big ? 8 : CUR === 'fireflies' ? 3 * Math.abs(moodV) : 0;
  }, 700);

  let A = null; // last applied settings snapshot
  function applyAll() {
    const prev = A; A = { ...S };
    if (!prev || effTheme() !== CUR || prev.glass !== S.glass || prev.focus !== S.focus || JSON.stringify(prev.made) !== JSON.stringify(S.made)) applyTheme();
    else { cv.style.opacity = S.strength; if (media) media.style.opacity = S.strength; }
    applyDeek(); syncUI();
  }
  chrome.storage.onChanged.addListener((ch, area) => { if (area === 'local' && ch.xot) { S = { ...DEF, ...ch.xot.newValue }; applyAll(); } });
  // instant boot: last theme cached in this site's localStorage so the wallpaper paints before the page even renders
  try {
    const b = JSON.parse(localStorage.getItem('xotBoot') || 'null');
    if (b && b.theme) { S = { ...DEF, ...b }; if (effTheme() !== 'off') { A = null; applyTheme(); A = { ...S }; } }
  } catch (e) {}
  const remember = () => { try { localStorage.setItem('xotBoot', JSON.stringify({ theme: S.theme, strength: S.strength, glass: S.glass, perPage: S.perPage, autoTime: S.autoTime, dayTheme: S.dayTheme, nightTheme: S.nightTheme, made: S.made, focus: S.focus })); } catch (e) {} };
  chrome.storage.onChanged.addListener((ch, area) => { if (area === 'local' && ch.xot) remember(); });
  chrome.storage.local.get('xot', o => { const go = sy => {
    const loc = o.xot || {}; S = { ...DEF, ...((sy && (sy._ts || 0) > (loc._ts || 0)) ? sy : loc) }; if (sy && (sy._ts || 0) > (loc._ts || 0)) chrome.storage.local.set({ xot: S }); remember();
    const mount = () => { document.documentElement.appendChild(host); applyAll(); };
    mount();
    if (!document.body) document.addEventListener('DOMContentLoaded', () => { if (deek && !deek.layer.isConnected) document.documentElement.appendChild(deek.layer); burst(); }, { once: true });
  }; try { chrome.storage.sync.get('xot', y => go(chrome.runtime.lastError ? null : y && y.xot)); } catch (e) { go(null); } });
  try { chrome.storage.onChanged.addListener((ch, area) => { if (area === 'sync' && ch.xot && ch.xot.newValue && (ch.xot.newValue._ts || 0) > (S._ts || 0)) chrome.storage.local.set({ xot: ch.xot.newValue }); }); } catch (e) {}
})();

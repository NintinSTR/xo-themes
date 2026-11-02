// Deek – a roaming, pokeable XO mascot
(() => {
  const POSES = ['ride', 'idle', 'idle2', 'front', 'front2', 'wave', 'wave2', 'wave3', 'thumbs', 'peace', 'peace2', 'think', 'think2', 'cross', 'sulk', 'shock', 'sign', 'xo', 'point', 'bored', 'shrug', 'hip'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const LINES = {
    gm: ['gm ☀️', 'gm ser', 'gm gm', 'wagmi'],
    idle: ['YES or NO? 🤔', 'LFXO 🚀', 'this market is cooking 🔥', 'predict the future, ser', 'who\'s on the leaderboard? 👀', 'bawk.', 'any alpha today?', 'stack your picks', 'odds looking juicy'],
    poke: ['bawk!', 'hey! 😳', 'that tickles', 'ouch ser', 'rude..', 'boop?', 'whaa—', 'hi to you too'],
    angry: ['stop it 😤', 'ok that\'s enough', 'I will rug you', 'chill ser!!'],
    sulk: ['not talking to you 😒', 'hmph.', 'ignored.'],
    grab: ['put me down!!', 'wheee', 'where are we going?', 'AAAA', 'careful, I\'m premium'],
    land: ['ow.', 'nailed it', '10/10 landing', 'again! again!', 'my feathers 😵'],
    tickle: ['hehehe 🤭', 'stoppp hahah', 'not the wings 😂'],
    dance: ['💃', 'vibing', 'XO XO XO', '🎶'],
    peck: ['what does this do?', '*click*', 'pressing buttons is my job', 'tap tap'],
    sleep: ['zzz', 'z z z', '💤'],
    peek: ['👀', 'how high is this?', 'jumping down!'],
    sign: ['GM', 'LFXO', 'YES', 'NO', 'WAGMI', 'HODL', '100x', 'XO'],
  };

  class Deek {
    constructor(opts) {
      this.url = opts.url; this.size = opts.size || 112; this.onEvent = opts.onEvent || (() => {});
      this.layer = document.createElement('div'); this.layer.id = 'xot-deek-layer';
      this.el = document.createElement('div'); this.el.className = 'xot-deek';
      this.shadow = document.createElement('div'); this.shadow.className = 'xot-deek-shadow';
      this.body = document.createElement('div'); this.body.className = 'xot-deek-body';
      this.img = document.createElement('img'); this.img.draggable = false; this.img.alt = 'Deek';
      this.board = document.createElement('div'); this.board.className = 'xot-deek-board';
      this.bubble = document.createElement('div'); this.bubble.className = 'xot-deek-bubble';
      this.broom = document.createElement('div'); this.broom.className = 'xot-deek-broom'; this.broom.innerHTML = '<svg viewBox="0 0 200 40" width="100%" height="100%" style="transform:scaleX(-1)"><defs><linearGradient id="xbst" x1="0" x2="1"><stop offset="0" stop-color="#7a4a22"/><stop offset="1" stop-color="#b07a3e"/></linearGradient><linearGradient id="xbbr" x1="0" x2="1"><stop offset="0" stop-color="#e9b44c"/><stop offset="1" stop-color="#a8741f"/></linearGradient></defs><rect x="8" y="17" width="150" height="6" rx="3" fill="url(#xbst)"/><rect x="146" y="14" width="8" height="12" rx="2" fill="#5b3416"/><path d="M152 14 L198 2 L194 20 L198 38 L152 26 Z" fill="url(#xbbr)"/><path d="M158 17 L196 8 M158 20 L197 20 M158 23 L196 32" stroke="#8a5a14" stroke-width="1.2"/></svg>'; this.legs = document.createElement('div'); this.legs.className = 'xot-deek-legs'; this.legs.innerHTML = '<svg viewBox="0 0 60 50" width="100%" height="100%"><g fill="none" stroke="#2b1a10" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2 L24 26 L36 40"/><path d="M34 2 L40 24 L52 36"/></g><g fill="none" stroke="#f39a1e" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2 L24 26 L36 40"/><path d="M34 2 L40 24 L52 36"/></g><g fill="#f39a1e" stroke="#2b1a10" stroke-width="1.6"><path d="M33 38 L44 44 L36 46 Z"/><path d="M49 34 L59 39 L51 42 Z"/></g></svg>'; this.acc = document.createElement('div'); this.acc.className = 'xot-deek-acc';
      this.hat = document.createElement('div'); this.hat.className = 'xot-acc-hat'; this.glasses = document.createElement('div'); this.glasses.className = 'xot-acc-glasses'; this.glasses.innerHTML = '<svg viewBox="0 0 100 34" width="100%" height="100%"><path d="M4 8 H96" stroke="#111" stroke-width="5"/><path d="M8 8 h36 q0 22 -18 22 q-18 0 -18 -22z M56 8 h36 q0 22 -18 22 q-18 0 -18 -22z" fill="#111"/><path d="M14 12 l8 0 M62 12 l8 0" stroke="#7af" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>';
      this.tie = document.createElement('div'); this.tie.className = 'xot-acc-tie'; this.prop = document.createElement('div'); this.prop.className = 'xot-acc-prop';
      this.acc.append(this.hat, this.glasses, this.tie, this.prop);
      this.cloud = document.createElement('div'); this.cloud.className = 'xot-deek-cloud'; this.cloud.innerHTML = '<div class="c">☁️</div><i></i><i></i><i></i><i></i>';
      this.body.append(this.legs, this.broom, this.img, this.board, this.acc); this.el.append(this.shadow, this.body, this.bubble, this.cloud);
      this.lastActive = performance.now(); this.streak = 0; this.comments = true; this.food = 0; this.layer.append(this.el);
      this.fx = document.createElement('div'); this.fx.className = 'xot-deek-fx'; this.layer.append(this.fx);
      POSES.forEach(p => { const i = new Image(); i.src = this.url(p); });
      this.vw = innerWidth; this.vh = innerHeight;
      this.x = this.vw * 0.7; this.y = -50; this.vx = 0; this.vy = 0; this.face = -1;
      this.state = 'fall'; this.timer = 0; this.plat = null; this.platforms = []; this.pose = 'idle';
      this.sx = 1; this.sy = 1; this.rot = 0; this.bob = 0; this.t = 0; this.pokes = []; this.mood = 'ok'; this.sulkUntil = 0;
      this.mouse = { x: -999, y: -999, t: 0, travel: 0, lastX: 0, lastY: 0 }; this.greeted = false;
      this.bindInput(); this.setPose('idle');
      this.w = this.size * 193 / 240; this.h = this.size;
      this.el.style.width = this.w + 'px'; this.el.style.height = this.h + 'px'; this.el.style.setProperty('--xs', this.size + 'px');
    }
    watchBets() {
      this._betH = e => {
        if (!/\/pulse/.test(location.pathname)) return;
        const b = e.target.closest && e.target.closest('button'); if (!b || b.closest('#xot-ui-host, #xot-deek-layer')) return;
        const t = b.textContent.replace(/\s+/g, ' ').trim();
        if (/^Up\b/i.test(t)) this.betSide = 'up'; else if (/^Down\b/i.test(t)) this.betSide = 'down';
        const m = t.match(/^Buy\s*(Up|Down|Yes|No)?/i);
        if (m && !b.disabled) { this.lastActive = performance.now(); this.onEvent('bet'); const sd = m[1] ? (/up|yes/i.test(m[1]) ? 'up' : 'down') : (this.betSide || 'up'); setTimeout(() => this.startRide(sd), 700); }
      };
      document.addEventListener('click', this._betH, true);
    }
    mount() { this.watchBets(); document.documentElement.appendChild(this.layer); this.scan(); this.last = performance.now(); this.running = true; this.loop = this.loop.bind(this); requestAnimationFrame(this.loop); this.scanIv = setInterval(() => this.scan(), 1500); }
    unmount() { if (this._betH) document.removeEventListener('click', this._betH, true); this.running = false; clearInterval(this.scanIv); this.layer.remove(); }
    setSize(s) { this.size = s; this.el.style.setProperty('--xs', s + 'px'); this.w = s * 193 / 240; this.h = s; this.el.style.width = this.w + 'px'; this.el.style.height = this.h + 'px'; }
    setPose(p) { if (this.seated) return; if (this.pose === p && this.img.src) return; this.pose = p; this.img.src = this.url(p); this.board.style.display = p === 'sign' ? 'flex' : 'none'; }
    say(txt, ms = 2200) { this.bubble.textContent = txt; this.bubble.classList.add('on'); clearTimeout(this.sayT); this.sayT = setTimeout(() => this.bubble.classList.remove('on'), ms); }

    // ---------- platforms: real elements on the page ----------
    scan() {
      this.vw = innerWidth; this.vh = innerHeight;
      const els = document.querySelectorAll('svg, canvas, button, a, [role="button"], img, input, h1, h2, h3, [class*="card" i], [class*="Card"], [class*="panel" i], [class*="tile" i], section, article, li, nav, header, aside, table, div');
      const out = []; const seen = new Set(); let n = 0;
      for (const el of els) {
        if (++n > 2500) break;
        if (el.closest('#xot-deek-layer, #xot-ui-host, #xot-bg, #xot-media')) continue;
        if ((el.tagName === 'svg' || el.tagName === 'CANVAS')) { const rr = el.getBoundingClientRect(); if (rr.width >= 240 && rr.height >= 110 && rr.top > this.h + 16 && rr.top < this.vh - 30) out.push({ el, x1: rr.left + 20, x2: rr.right - 20, y: rr.top + 4, tag: 'CHART', chart: true }); continue; }
        const r = el.getBoundingClientRect();
        if (r.width < 70 || r.height < 18 || r.width > this.vw * 0.92) continue;
        if (r.top < this.h + 16 || r.top > this.vh - 30 || r.right < 20 || r.left > this.vw - 20) continue;
        const tag = el.tagName; let solid = /^(BUTTON|IMG|INPUT|H1|H2|H3|A|TABLE)$/.test(tag) || el.getAttribute('role') === 'button';
        if (!solid) { const cs = getComputedStyle(el); const bg = cs.backgroundColor; solid = (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) || parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== 'none' || cs.backgroundImage !== 'none'; if (el.dataset.xotBg) solid = true; }
        if (!solid) continue;
        const key = Math.round(r.top / 6) + ':' + Math.round(r.left / 30); if (seen.has(key)) continue; seen.add(key);
        out.push({ el, x1: r.left + 8, x2: r.right - 8, y: r.top, tag });
        if (out.length > 90) break;
      }
      this.platforms = out;
    }
    floor() { return { el: null, x1: 10, x2: this.vw - 10, y: this.vh - 2, tag: 'FLOOR' }; }
    platY(p) { if (!p.el) { p.y = this.vh - 2; p.x2 = this.vw - 10; return true; } if (!p.el.isConnected) return false; const r = p.el.getBoundingClientRect(); if (r.width < 30) return false; p.x1 = r.left + 8; p.x2 = r.right - 8; p.y = r.top; return p.y > this.h * 0.6 && p.y < this.vh + 5; }

    // ---------- input ----------
    bindInput() {
      const im = this.img; let down = null;
      im.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); im.setPointerCapture(e.pointerId); down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, ox: e.clientX - this.x, oy: e.clientY - (this.y - this.h / 2) }; this.drag = null; });
      im.addEventListener('pointermove', e => {
        if (!down) return;
        if (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down.moved = true; this.startGrab(); }
        if (down.moved) { const nx = e.clientX - down.ox, ny = e.clientY - down.oy + this.h / 2; this.drag = this.drag || { hist: [] }; this.drag.hist.push({ x: nx, y: ny, t: performance.now() }); if (this.drag.hist.length > 6) this.drag.hist.shift(); this.tx = nx; this.ty = ny; }
      });
      const up = e => {
        if (!down) return; const d = down; down = null;
        if (d.moved) this.release(); else if (e.shiftKey) this.feed(); else if (e.altKey) this.pet(); else this.poke(e);
      };
      im.addEventListener('pointerup', up); im.addEventListener('pointercancel', up);
      im.addEventListener('dblclick', e => { e.preventDefault(); this.dance(); });
      im.addEventListener('pointerenter', () => { this.hover = true; });
      im.addEventListener('pointerleave', () => { this.hover = false; });
      addEventListener('pointermove', e => {
        this.lastActive = performance.now(); const m = this.mouse; const d = Math.hypot(e.clientX - m.lastX, e.clientY - m.lastY); m.lastX = e.clientX; m.lastY = e.clientY; m.x = e.clientX; m.y = e.clientY; m.t = performance.now();
        if (this.hover && this.state !== 'grab') { m.travel += d; if (m.travel > 900) { m.travel = 0; this.tickle(); } }
      }, { passive: true });
      setInterval(() => { this.mouse.travel *= 0.4; }, 700);
      addEventListener('resize', () => { this.vw = innerWidth; this.vh = innerHeight; this.scan(); });
      addEventListener('scroll', () => { this.scrolled = true; }, { passive: true, capture: true });
    }
    poke() {
      const now = performance.now(); this.pokes = this.pokes.filter(t => now - t < 4000); this.pokes.push(now);
      this.feathers(5); this.onEvent('poke');
      if (now < this.sulkUntil) { this.say(pick(LINES.sulk)); this.setPose('sulk'); this.squash(1.1, 0.9); return; }
      const n = this.pokes.length;
      if (n >= 7) { this.sulkUntil = now + 9000; this.pokes = []; this.go('sulk', 9000); this.say(pick(LINES.sulk), 3000); return; }
      if (n >= 4) { this.go('angry', 1800); this.say(pick(LINES.angry)); return; }
      this.go('shock', 700); this.say(pick(LINES.poke), 1500);
      if (this.onGround()) { this.vy = -5.5; this.state = 'air'; this.airPose = 'shock'; this.timer = 0; this.plat = null; }
    }
    tickle() { if (performance.now() < this.sulkUntil) return; this.go('giggle', 1600); this.say(pick(LINES.tickle), 1500); }
    dance() { if (performance.now() < this.sulkUntil) { this.say('no.'); return; } this.go('dance', 3200); this.say(pick(LINES.dance), 2500); }
    startGrab() { this.standUp(); this.state = 'grab'; this.plat = null; this.setPose('shock'); this.say(pick(LINES.grab), 1800); this.grabT = 0; this.onEvent('grab'); }
    release() {
      const h = (this.drag && this.drag.hist) || []; let vx = 0, vy = 0;
      if (h.length > 1) { const a = h[0], b = h[h.length - 1], dt = Math.max(16, b.t - a.t); vx = (b.x - a.x) / dt * 16; vy = (b.y - a.y) / dt * 16; }
      this.vx = clamp(vx, -40, 40); this.vy = clamp(vy, -40, 30); this.state = 'air'; this.airPose = Math.hypot(this.vx, this.vy) > 12 ? 'peace' : 'shock'; this.thrown = Math.hypot(this.vx, this.vy) > 12; if (this.thrown) this.say('wheeee!', 1200); this.drag = null;
    }
    onGround() { return this.state !== 'air' && this.state !== 'grab' && this.state !== 'fall' && this.state !== 'hop'; }

    // ---------- behaviour ----------
    go(state, ms) { this.state = state; this.timer = ms || 0; this.stateT = 0; }
    think() {
      if (!this.plat) { this.state = 'air'; return; }
      if (performance.now() - this.lastActive > 180000 && this.state !== 'sleep') { this.go('sleep', 120000); this.say('getting sleepy… 😴', 2200); return; }
      const near = this.mouse.x > 0 && Math.hypot(this.mouse.x - this.x, this.mouse.y - (this.y - this.h / 2)) < 220 && performance.now() - this.mouse.t < 3000;
      if (near && !this.greeted) { this.greeted = true; this.face = this.mouse.x > this.x ? 1 : -1; this.go('wave', 1800); this.say(pick(LINES.gm)); return; }
      const opts = [['walk', 30], ['idle', 16], ['hop', this.platforms.length ? (this.plat && !this.plat.el ? 40 : 24) : 0], ['peck', this.plat.el ? 12 : 0], ['think', 7], ['sign', 6], ['xo', 5], ['sleep', 3], ['peek', this.plat.el ? 7 : 0], ['chase', near ? 10 : 2], ['pose', 7]];
      let tot = opts.reduce((s, o) => s + o[1], 0), k = Math.random() * tot, choice = 'idle';
      for (const [n, w] of opts) { if ((k -= w) < 0) { choice = n; break; } }
      const p = this.plat;
      switch (choice) {
        case 'walk': this.target = rnd(p.x1 + this.w * 0.3, p.x2 - this.w * 0.3); this.go('walk', 6000); break;
        case 'chase': this.target = clamp(this.mouse.x, p.x1 + 10, p.x2 - 10); this.go('walk', 5000); this.speedMul = 1.8; break;
        case 'idle': this.go('idle', rnd(1000, 2500)); if (Math.random() < 0.3) this.say(pick(LINES.idle)); break;
        case 'hop': { const t = this.pickHop(); if (t) { this.hopTo(t); } else this.go('idle', 1500); break; }
        case 'peck': this.target = Math.random() < 0.5 ? p.x1 + 14 : p.x2 - 14; this.go('walk', 5000); this.afterWalk = 'peck'; break;
        case 'think': this.go('think', rnd(2500, 4000)); this.say(pick(['hmm… YES or NO? 🤔', 'calculating odds…', 'thinking about kickoff', 'should I stack one more pick?']), 3200); break;
        case 'sign': this.go('sign', rnd(3500, 5000)); this.board.textContent = pick(LINES.sign); break;
        case 'xo': this.go('xo', 3000); this.say('XO!', 1500); break;
        case 'sleep': this.go('sleep', rnd(6000, 10000)); break;
        case 'peek': this.target = Math.random() < 0.5 ? p.x1 + 4 : p.x2 - 4; this.go('walk', 5000); this.afterWalk = 'peek'; break;
        case 'pose': this.go('pose', 2200); this.posePick = pick(['thumbs', 'peace2', 'hip', 'wave3', 'front2', 'shrug']); if (Math.random() < 0.5) this.say(pick(LINES.idle)); break;
      }
    }
    pickHop() {
      const c = this.platforms.filter(q => q !== this.plat && this.platY(q) && q.x2 - q.x1 > this.w * 0.8 && Math.abs((q.x1 + q.x2) / 2 - this.x) < 600 && this.y - q.y < 720 && Math.abs(q.y - this.y) > 6);
      const ch = c.filter(q => q.chart); if (ch.length && Math.random() < 0.45) return pick(ch);
      if (Math.random() < 0.18 || !c.length) return this.plat && this.plat.el ? this.floor() : null;
      return pick(c);
    }
    hopTo(q) {
      const tx = clamp(rnd(q.x1 + this.w * 0.3, q.x2 - this.w * 0.3), q.x1, q.x2);
      const dy = q.y - this.y, peak = Math.min(dy, 0) - rnd(50, 100);
      const g = 0.55; const vy0 = -Math.sqrt(2 * g * -peak);
      // time to fall from peak to target
      const tUp = -vy0 / g, tDown = Math.sqrt(2 * Math.max(1, dy - peak) / g), T = tUp + tDown;
      this.vx = (tx - this.x) / T; this.vy = vy0; this.face = this.vx > 0 ? 1 : -1;
      this.hopTarget = q; this.state = 'crouch'; this.timer = 180; this.stateT = 0; this.airPose = 'peace';
    }

    // ---------- loop ----------
    loop(now) {
      if (!this.running) return;
      const dt = Math.min(50, now - this.last); this.last = now; const k = dt / 16.67; this.t += dt;
      if (document.hidden) { requestAnimationFrame(this.loop); return; }
      this.step(k, dt); if (this.buddy) this.stepBuddy(k);
      this.render();
      requestAnimationFrame(this.loop);
    }
    land(q, hard) {
      this.plat = q; this.y = q.y; this.vy = 0; this.vx = 0; this.squash(1.25, 0.75);
      if (hard) { this.go('ouch', 1400); this.say(pick(LINES.land), 1600); this.feathers(6); }
      else if (q.chart) { this.go('watch', rnd(4000, 6500)); this.say(pick(['watching the chart 👀', 'pump it 📈', 'UP or DOWN? 🤔', 'this candle tho', 'ser, it\'s moving']), 2400); }
      else this.go('idle', rnd(500, 1300));
      this.thrown = false;
    }
    squash(sx, sy) { this.sx = sx; this.sy = sy; }
    step(k, dt) {
      const g = 0.55 * k; this.stateT = (this.stateT || 0) + dt;
      this.sx += (1 - this.sx) * 0.18 * k; this.sy += (1 - this.sy) * 0.18 * k; this.rot *= Math.pow(0.85, k); this.bob = 0;
      const S = this.state;
      if (S === 'rideIn' || S === 'ride' || S === 'rideEnd') { this.rideStep(k, dt); return; }
      if (S === 'grab') {
        this.grabT += dt; const px = this.x, tx = this.tx ?? this.x, ty = this.ty ?? this.y;
        this.x += (tx - this.x) * 0.45 * k; this.y += (ty - this.y) * 0.45 * k; const vx = this.x - px;
        this.rot = clamp(-vx * 2.2, -35, 35) + Math.sin(this.t / 140) * 6;
        this.setPose(this.grabT > 900 ? (Math.sin(this.t / 400) > 0 ? 'wave2' : 'shock') : 'shock'); return;
      }
      if (S === 'air' || S === 'fall' || S === 'hop') {
        const prevY = this.y; this.vy += g; this.x += this.vx * k; this.y += this.vy * k;
        if (this.x < this.w / 2) { this.x = this.w / 2; this.vx = Math.abs(this.vx) * 0.6; this.squash(0.8, 1.15); }
        if (this.x > this.vw - this.w / 2) { this.x = this.vw - this.w / 2; this.vx = -Math.abs(this.vx) * 0.6; this.squash(0.8, 1.15); }
        if (this.y < this.h) { if (this.vy < 0) this.vy *= 0.5; }
        this.rot = clamp(this.vx * 1.5, -25, 25);
        this.setPose(this.vy < -2 ? (this.airPose || 'peace') : 'shock');
        if (this.vx) this.face = this.vx > 0 ? 1 : -1;
        if (this.vy > 0) {
          const cands = S === 'hop' && this.hopTarget ? [this.hopTarget] : this.platforms;
          for (const q of cands) {
            if (!this.platY(q)) continue;
            if (prevY <= q.y + 1 && this.y >= q.y && this.x >= q.x1 - 6 && this.x <= q.x2 + 6) { this.land(q, this.thrown && this.vy > 14); return; }
          }
          if (S === 'hop' && this.hopTarget && this.y > this.hopTarget.y + 40) this.state = 'air';
          const fl = this.vh - 2;
          if (this.y >= fl) {
            if (this.vy > 16) { this.y = fl; this.vy = -this.vy * 0.35; this.vx *= 0.7; this.squash(1.3, 0.7); this.feathers(4); if (Math.abs(this.vy) < 5) this.land(this.floor(), true); }
            else this.land(this.floor(), this.thrown);
          }
        }
        return;
      }
      if (S === 'crouch') { this.setPose('idle'); this.sx = 1.15; this.sy = 0.85; if (this.stateT > this.timer) { this.state = 'hop'; this.plat = null; this.squash(0.8, 1.25); } return; }
      // grounded: follow the element we are standing on
      if (this.plat) {
        if (!this.platY(this.plat)) { this.plat = null; this.state = 'air'; this.vy = 0; this.vx = 0; this.airPose = 'shock'; this.say(pick(['whoa—', 'AAA', 'hey where did it go']), 1200); return; }
        this.y = this.plat.y;
        if (this.x < this.plat.x1 - 4 || this.x > this.plat.x2 + 4) { this.plat = null; this.state = 'air'; this.vy = -1; return; }
      } else { this.state = 'air'; return; }

      const lookAtMouse = () => { if (performance.now() - this.mouse.t < 2500 && Math.abs(this.mouse.x - this.x) > 30) this.face = this.mouse.x > this.x ? 1 : -1; };
      const breath = Math.sin(this.t / 420) * 0.015; this.sy += breath * 0.2;
      switch (S) {
        case 'walk': {
          const sp = 1.6 * (this.speedMul || 1) * k, d = this.target - this.x;
          if (Math.abs(d) < 3 || this.stateT > this.timer) { this.speedMul = 1; const a = this.afterWalk; this.afterWalk = null; if (a === 'peck') this.doPeck(); else if (a === 'peek') this.doPeek(); else this.go('idle', rnd(600, 1800)); break; }
          this.face = d > 0 ? 1 : -1; this.x += Math.sign(d) * Math.min(Math.abs(d), sp);
          const ph = this.t / (this.speedMul > 1 ? 70 : 105);
          this.setPose(Math.sin(ph) > 0 ? 'idle' : 'idle2'); this.rot = Math.sin(ph) * 7; this.bob = -Math.abs(Math.sin(ph)) * 5; break;
        }
        case 'idle': this.setPose(this.mood === 'ok' ? (this.hover ? 'front2' : 'idle') : 'cross'); lookAtMouse(); if (this.hover && Math.random() < 0.01) this.say(pick(['👋', 'hi!', 'poke me, I dare you'])); break;
        case 'wave': this.setPose(Math.sin(this.t / 160) > 0 ? 'wave' : 'wave2'); break;
        case 'shock': this.setPose('shock'); this.rot = Math.sin(this.t / 30) * 4; break;
        case 'angry': this.setPose('cross'); this.rot = Math.sin(this.t / 45) * 3; this.bob = -Math.abs(Math.sin(this.t / 90)) * 4;
          if (this.stateT > this.timer) { const q = this.pickHop(); if (q) this.hopTo(q); else this.go('idle', 1000); } return;
        case 'sulk': this.setPose('sulk'); this.face = this.mouse.x > this.x ? -1 : 1; break;
        case 'giggle': this.setPose(Math.sin(this.t / 90) > 0 ? 'think2' : 'peace'); this.rot = Math.sin(this.t / 40) * 8; this.bob = -Math.abs(Math.sin(this.t / 70)) * 6; break;
        case 'dance': { const ph = this.t / 220; this.setPose(['peace', 'peace2', 'thumbs', 'hip'][Math.floor(ph) % 4]); this.rot = Math.sin(ph * Math.PI) * 12; this.bob = -Math.abs(Math.sin(ph * Math.PI)) * 14; if (Math.floor(ph) % 2) this.face = -this.face * 0 + (Math.floor(ph / 2) % 2 ? 1 : -1); break; }
        case 'think': this.setPose(Math.floor(this.stateT / 1500) % 2 ? 'think2' : 'think'); break;
        case 'sign': this.setPose('sign'); this.face = 1; this.bob = -Math.abs(Math.sin(this.t / 300)) * 3; break;
        case 'xo': this.setPose('xo'); this.rot = Math.sin(this.t / 200) * 8; this.bob = -Math.abs(Math.sin(this.t / 200)) * 8; break;
        case 'sleep': this.setPose('bored'); this.sy = 1 + Math.sin(this.t / 700) * 0.03; if (Math.floor(this.stateT / 2200) !== this._zz) { this._zz = Math.floor(this.stateT / 2200); this.say(pick(LINES.sleep), 1800); } if (this.hover) { this.go('shock', 700); this.say('huh?! I was awake', 1500); } break;
        case 'pose': this.setPose(this.posePick || 'thumbs'); break;
        case 'peck': this.setPose(Math.floor(this.stateT / 260) % 2 ? 'point' : 'idle'); if (this.peckEl && Math.floor(this.stateT / 520) !== this._pk) { this._pk = Math.floor(this.stateT / 520); this.wiggle(this.peckEl); } break;
        case 'peek': this.setPose('think'); this.rot = this.face * 10; break;
        case 'watch': { const ph = Math.floor(this.stateT / 1400) % 4; this.setPose(['think', 'point', 'think2', 'thumbs'][ph]); this.face = ph === 1 ? (this.x > (this.plat.x1 + this.plat.x2) / 2 ? -1 : 1) : this.face; this.bob = ph === 3 ? -Math.abs(Math.sin(this.t / 160)) * 6 : 0; break; }
        case 'ouch': this.setPose(this.stateT < 600 ? 'shock' : 'cross'); break;
        case 'pose2': break;
      }
      if (this.timer && this.stateT > this.timer) {
        if (S === 'peek') { const q = this.floor(); this.vx = this.face * 2.5; this.vy = -6; this.state = 'air'; this.plat = null; this.airPose = 'peace'; this.thrown = false; return; }
        if (S === 'sulk' || S === 'ouch') this.mood = 'ok';
        this.think();
      } else if (!this.timer) this.think();
    }
    doPeck() { this.peckEl = this.plat && this.plat.el; this.face = this.x < (this.plat.x1 + this.plat.x2) / 2 ? -1 : 1; this.go('peck', 2200); this.say(pick(LINES.peck), 1800); this.onEvent('peck'); }
    doPeek() { this.go('peek', 1600); this.say(pick(LINES.peek), 1400); }
    wiggle(el) { if (!el || !el.animate) return; try { el.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(2px) rotate(-1.2deg)' }, { transform: 'translateY(-1px) rotate(1deg)' }, { transform: 'translateY(0) rotate(0)' }], { duration: 320, easing: 'ease-out', composite: 'add' }); } catch (e) {} }
    feathers(n) {
      for (let i = 0; i < n; i++) {
        const f = document.createElement('div'); f.className = 'xot-feather'; f.textContent = pick(['🪶', '✦', '•']);
        const x = this.x + rnd(-20, 20), y = this.y - this.h * rnd(0.3, 0.8); f.style.left = x + 'px'; f.style.top = y + 'px';
        this.fx.append(f);
        f.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${rnd(-60, 60)}px, ${rnd(20, 70)}px) rotate(${rnd(-180, 180)}deg)`, opacity: 0 }], { duration: rnd(700, 1200), easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => f.remove();
      }
    }


    // ---------- outfits, streak mood, feeding ----------
    setOutfit(o) {
      if (o === 'auto') { const d = new Date(), m = d.getMonth() + 1, day = d.getDate(); o = (m === 10 && day >= 15) || (m === 11 && day <= 2) ? 'halloween' : (m === 12 && day >= 10) || (m === 1 && day <= 5) ? 'santa' : 'none'; }
      this.outfit = o; const H = this.hat, T = this.tie, P = this.prop; H.innerHTML = ''; T.innerHTML = ''; P.textContent = ''; this.el.dataset.outfit = o;
      if (o === 'halloween') { H.innerHTML = '<svg viewBox="0 0 100 80" width="100%" height="100%"><ellipse cx="50" cy="70" rx="48" ry="9" fill="#2a1240" stroke="#111" stroke-width="3"/><path d="M28 68 L54 4 Q60 2 62 10 L72 68 Z" fill="#3b1a5c" stroke="#111" stroke-width="3" stroke-linejoin="round"/><path d="M31 58 L70 58 L72 66 L29 66Z" fill="#ff8a1f"/><rect x="45" y="56" width="12" height="11" rx="2" fill="#ffd23f" stroke="#111" stroke-width="2"/></svg>'; P.textContent = '🎃'; }
      else if (o === 'santa') { H.innerHTML = '<svg viewBox="0 0 100 80" width="100%" height="100%"><path d="M18 64 Q30 8 66 10 Q86 14 92 40 L84 44 Q78 28 66 26 L80 64Z" fill="#e3262f" stroke="#111" stroke-width="3" stroke-linejoin="round"/><circle cx="88" cy="46" r="9" fill="#fff" stroke="#111" stroke-width="2.5"/><rect x="10" y="60" width="78" height="15" rx="7" fill="#fff" stroke="#111" stroke-width="3"/></svg>'; T.innerHTML = '<svg viewBox="0 0 60 30" width="100%" height="100%"><path d="M4 6 Q30 18 56 6 L56 14 Q30 26 4 14Z" fill="#2fa84f" stroke="#111" stroke-width="2"/></svg>'; P.textContent = '🎁'; }
      else if (o === 'trader') { H.innerHTML = '<svg viewBox="0 0 100 80" width="100%" height="100%"><ellipse cx="50" cy="70" rx="44" ry="8" fill="#111"/><rect x="26" y="14" width="48" height="56" rx="5" fill="#1b1b1f" stroke="#000" stroke-width="2"/><rect x="26" y="54" width="48" height="8" fill="#d7f25b"/></svg>'; T.innerHTML = '<svg viewBox="0 0 30 60" width="100%" height="100%"><path d="M9 2 H21 L18 10 L24 46 L15 58 L6 46 L12 10Z" fill="#d7f25b" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/></svg>'; P.textContent = '💼'; }
      else if (o === 'hoodie') { H.innerHTML = '<svg viewBox="0 0 100 80" width="100%" height="100%"><path d="M14 62 Q14 22 50 18 Q86 22 86 62 Z" fill="#ff5fb7" stroke="#111" stroke-width="3"/><path d="M50 18 Q60 40 98 58 L96 66 Q60 52 46 30Z" fill="#e0449c" stroke="#111" stroke-width="3" stroke-linejoin="round"/><text x="44" y="52" font-size="18" font-weight="900" fill="#fff" font-family="sans-serif">XO</text></svg>'; T.innerHTML = '<svg viewBox="0 0 60 30" width="100%" height="100%"><path d="M6 4 Q30 30 54 4" fill="none" stroke="#f5c542" stroke-width="4" stroke-dasharray="4 3"/><circle cx="30" cy="22" r="5" fill="#f5c542" stroke="#111" stroke-width="1.5"/></svg>'; P.textContent = '🛹'; }
    }
    setStreak(n) {
      const was = this.streak; this.streak = n;
      this.el.classList.toggle('hot', n >= 3); this.el.classList.toggle('rainy', n <= -3);
      if (n >= 3 && was < 3) this.say('on fire 😎🔥', 2600); if (n <= -3 && was > -3) this.say('my own rain cloud… ☔', 2600);
      if (was <= -3 && n > -3) this.say('the sun is out! ☀️', 2400);
    }
    feed() {
      this.lastActive = performance.now(); if (this.state === 'sleep') this.go('idle', 800);
      this.food++; const f = document.createElement('div'); f.className = 'xot-feather'; f.textContent = pick(['🌽', '🌽', '🍪', '🍕', '🍩']); f.style.fontSize = '22px';
      const sx = this.x + rnd(-120, 120), sy = this.y - this.h - 140; f.style.left = sx + 'px'; f.style.top = sy + 'px'; this.fx.append(f);
      f.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${this.x - sx}px, ${this.y - this.h * 0.55 - sy}px) rotate(360deg)` }], { duration: 700, easing: 'cubic-bezier(.5,0,.8,.6)' }).onfinish = () => { f.remove(); this.squash(1.2, 0.85); this.say(pick(['nom nom 😋', 'more pls', 'yummy!', this.food > 4 ? 'I\'m so full 🫃' : 'tasty ser']), 1600); if (this.onGround() && !this.seated) { this.go('giggle', 1200); } for (let i = 0; i < 3; i++) setTimeout(() => this.sparkle(), i * 90); };
    }
    pet() { this.lastActive = performance.now(); if (this.state === 'sleep') { this.go('idle', 800); this.say('huh? oh hi 🥱', 1600); return; } this.say(pick(['❤️', 'aww', 'more pets pls 🥰', 'purr… wait, I\'m a chicken']), 1600); const f = document.createElement('div'); f.className = 'xot-feather'; f.textContent = '❤️'; f.style.left = this.x + 'px'; f.style.top = (this.y - this.h) + 'px'; this.fx.append(f); f.animate([{ transform: 'translateY(0) scale(.6)', opacity: 1 }, { transform: 'translateY(-50px) scale(1.4)', opacity: 0 }], { duration: 1000 }).onfinish = () => f.remove(); }
    // ---------- buddy chick ----------
    setFriend(on) {
      if (on && !this.buddy) { const b = document.createElement('div'); b.className = 'xot-buddy'; b.innerHTML = '<span>🐤</span>'; this.layer.append(b); this.buddy = { el: b, x: this.x - 60, y: this.vh - 2, vy: 0, chase: 0, face: 1, next: performance.now() + 15000 }; }
      else if (!on && this.buddy) { this.buddy.el.remove(); this.buddy = null; }
    }
    stepBuddy(k) {
      const b = this.buddy; if (!b) return; const now = performance.now();
      if (now > b.next && !b.chase && this.onGround()) { b.chase = now + 7000; b.next = now + rnd(30000, 60000); this.say(pick(['not you again 😩', 'stop following me!', 'run!!']), 2000); if (this.plat) { this.target = this.x < this.vw / 2 ? this.plat.x2 - 20 : this.plat.x1 + 20; this.go('walk', 5000); this.speedMul = 2.2; } }
      if (b.chase && now > b.chase) { b.chase = 0; }
      const fy = this.onGround() && !this.seated ? this.y : this.vh - 2;
      const tx = this.x - (b.chase ? 0 : this.face * (this.w * 0.6 + 26)); const sp = b.chase ? 0.09 : 0.03;
      const dx = tx - b.x; b.x += dx * sp * k; if (Math.abs(dx) > 2) b.face = dx > 0 ? -1 : 1;
      if (b.y < fy - 1 || b.vy) { b.vy += 0.6 * k; b.y += b.vy * k; if (b.y >= fy) { b.y = fy; b.vy = 0; } } else b.y = fy;
      if (Math.abs(dx) > 30 && b.vy === 0 && Math.random() < 0.06) b.vy = -4;
      if (b.y > fy + 4) b.y = fy;
      if (b.chase && Math.abs(this.x - b.x) < 20 && Math.random() < 0.02) { this.feathers(2); this.say('ouch, he pecked me', 1400); }
      b.el.style.transform = `translate(${b.x - 14}px, ${b.y - 30 + (Math.abs(dx) > 3 ? -Math.abs(Math.sin(this.t / 80)) * 4 : 0)}px)`; b.el.firstChild.style.transform = `scaleX(${b.face})`;
    }
    // ---------- Pulse: ride the 60s TWAP line on a broom after a bet ----------
    chartCanvases() {
      return [...document.querySelectorAll('canvas')].filter(c => c.id !== 'xot-bg' && !c.closest('#xot-deek-layer, #xot-ui-host')).filter(c => { const r = c.getBoundingClientRect(); return r.width > 240 && r.height > 110; });
    }
    findTwap() {
      const cs = this.chartCanvases().sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return rb.width * rb.height - ra.width * ra.height; }).slice(0, 1);
      for (const c of cs) {
        // copy the chart into our own canvas and read it once, never touching the site's own canvas context
        const W = c.width, H = c.height; if (!W || !H) continue;
        if (!this._snap) { this._snap = document.createElement('canvas'); this._snapCtx = this._snap.getContext('2d', { willReadFrequently: true }); }
        const sn = this._snap, ctx = this._snapCtx; if (sn.width !== W) sn.width = W; if (sn.height !== H) sn.height = H;
        const r = c.getBoundingClientRect(), sx = W / r.width, sy = H / r.height;
        try {
          ctx.clearRect(0, 0, W, H); ctx.drawImage(c, 0, 0);
          const all = ctx.getImageData(0, 0, W, H).data;
          for (let x = W - 2; x > W * 0.25; x -= Math.max(2, Math.round(sx * 2))) {
            let sum = 0, n = 0;
            for (let y = 0; y < H; y++) { const i = (y * W + x) * 4, R = all[i], G = all[i + 1], B = all[i + 2], A = all[i + 3]; if (A > 150 && ((R > 200 && G > 70 && G < 175 && B > 105 && B < 205 && R - G > 70) || (B > 200 && R > 100 && R < 200 && G > 80 && G < 175 && B - G > 55))) { sum += y; n++; } }
            if (n >= 2) return { x: r.left + x / sx, y: r.top + sum / n / sy, box: r };
          }
        } catch (e) { /* tainted */ }
      }
      // fallback: the DOM label that marks the TWAP head
      const lab = [...document.querySelectorAll('div,span,p')].find(e => e.childElementCount < 3 && /^60s TWAP/.test(e.textContent.trim()) && e.getBoundingClientRect().width < 200 && e.getBoundingClientRect().top > 120);
      if (lab) { const r = lab.getBoundingClientRect(); return { x: r.left - 6, y: r.top + r.height / 2, box: null }; }
      return null;
    }
    findBeatY() {
      const el = [...document.querySelectorAll('div,span')].find(e => e.childElementCount === 0 && e.textContent.trim() === 'Price to beat' && e.getBoundingClientRect().width < 160 && e.getBoundingClientRect().top > 150);
      if (!el) return null; const r = el.getBoundingClientRect(); return r.top + r.height / 2;
    }
    countdown() {
      const lab = [...document.querySelectorAll('div,span,p')].find(e => e.childElementCount === 0 && e.textContent.trim() === 'Ends in');
      if (!lab) return null; let p = lab.parentElement; for (let i = 0; i < 3 && p; i++, p = p.parentElement) { const m = p.textContent.match(/(\d{1,2}):(\d{2})/); if (m) return +m[1] * 60 + +m[2]; }
      return null;
    }
    startRide(side) {
      if (!this.running) return;
      const h = this.findTwap(); if (!h) { this.say(side === 'up' ? 'UP it is 📈' : 'DOWN it is 📉', 2200); return; }
      this.side = side; this.rideHead = h; this.rideFrom = { x: this.x, y: this.y }; this.rideWin = null; this.rideLast = -1; this.rideMsgT = 0; this.rideCD = this.countdown(); this.rideStart = performance.now();
      this.plat = null; this.go('rideIn', 1500); this.setPose('shock'); this.say(pick(['ACCIO BROOM 🧹', 'hold my feathers', 'wingardium leviosa ✨', 'I\'m riding this one']), 1800);
    }
    rideSeat(h) { return this.seated ? { x: h.x - this.w / 2 - 4, y: h.y + this.h * 0.245 } : { x: h.x - this.w * 0.6, y: h.y + this.h * 0.2 }; }
    sitDown() {
      const H = this.size * 1.05, W = H * 360 / 328; this.w = W; this.h = H;
      this.el.style.width = W + 'px'; this.el.style.height = H + 'px';
      this.pose = 'ride'; this.img.src = this.url('ride'); this.seated = true; this.el.classList.add('seated');
    }
    standUp() { if (!this.seated) return; this.seated = false; this.el.classList.remove('seated'); this.setSize(this.size); this.pose = ''; this.setPose('shock'); }
    rideStep(k, dt) {
      this.stateT += 0; const now = performance.now();
      if (!/\/pulse/.test(location.pathname)) { this.endRide(); return; }
      if (!this._rt || now - this._rt > 280) { this._rt = now; const h = this.findTwap(); if (h) this.rideHead = h; this.beatY = this.findBeatY(); const cd = this.countdown(); if (cd !== null) { if (this.rideCD !== null && (cd > this.rideCD + 20 || cd === 0) && this.state === 'ride') this.finishRide(); if (cd !== this.rideCD && cd <= 5 && cd > 0 && this.state === 'ride') this.onEvent('tick', cd); if (this.comments && this.state === 'ride' && cd === 10 && this._said10 !== this.rideStart) { this._said10 = this.rideStart; this.say(pick(['10s left, hold on! ⏳', '10 seconds… 🤞', 'final stretch!']), 2200); this.rideMsgT = now; } this.rideCD = cd; }
        if (this.comments && this.state === 'ride' && h) { const hist = this._yh || (this._yh = []); hist.push({ t: now, y: h.y }); while (hist.length && now - hist[0].t > 1500) hist.shift(); const dy = hist[0].y - h.y; if (Math.abs(dy) > 28 && now - (this._flyT || 0) > 8000) { this._flyT = now; this.rideMsgT = now; this.say(dy > 0 ? pick(['price is flying 🚀', 'WOOO up we go', 'send it 📈']) : pick(['that one hurt 😵', 'dumping!! 📉', 'whoa, big red candle']), 2000); } } }
      const seat = this.rideSeat(this.rideHead);
      if (this.state === 'rideIn') {
        const t = clamp(this.stateT / this.timer, 0, 1), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const cx = (this.rideFrom.x + seat.x) / 2, cy = Math.min(this.rideFrom.y, seat.y) - 220;
        const px = this.x; this.x = (1 - e) * (1 - e) * this.rideFrom.x + 2 * (1 - e) * e * cx + e * e * seat.x; this.y = (1 - e) * (1 - e) * this.rideFrom.y + 2 * (1 - e) * e * cy + e * e * seat.y;
        this.face = this.x >= px ? 1 : -1; this.rot = clamp((this.x - px) * 2, -18, 18); this.setPose(t < 0.3 ? 'shock' : 'peace');
        if (Math.random() < 0.35) this.sparkle();
        if (t >= 1) { this.sitDown(); this.go('ride', 0); this.squash(1.15, 0.85); this.face = 1; this.say(this.side === 'up' ? 'riding UP 🧹📈' : 'riding DOWN 🧹📉', 2200); }
        return;
      }
      // follow the line head smoothly, hover-bob like a broom
      this.x += (seat.x - this.x) * 0.12 * k; this.y += (seat.y - this.y) * 0.12 * k;
      this.bob = Math.sin(this.t / 380) * 3; this.rot = Math.sin(this.t / 600) * 4;
      if (Math.random() < 0.04) this.sparkle();
      if (this.state === 'rideEnd') {
        if (this.rideWin) { const ph = this.t / 200; this.setPose(['peace', 'thumbs', 'peace2', 'xo'][Math.floor(ph) % 4]); this.bob = -Math.abs(Math.sin(ph * Math.PI)) * 16; this.rot = Math.sin(ph * Math.PI) * 10; if (Math.random() < 0.15) this.sparkle(true); }
        else { this.setPose(this.stateT < 900 ? 'shock' : 'sulk'); if (this.seated) { this.rot = this.stateT < 900 ? Math.sin(this.t / 40) * 6 : -10; this.bob = this.stateT < 900 ? 0 : 6; } }
        if (this.stateT > 4200) this.endRide();
        return;
      }
      if (now - this.rideStart > 6.5 * 60000) { this.endRide(); return; }
      // winning or losing?
      let win = null;
      if (this.beatY != null) win = this.side === 'up' ? this.rideHead.y < this.beatY - 1 : this.rideHead.y > this.beatY + 1;
      const ph = Math.floor(this.t / 1600) % 3;
      if (this.seated) { if (win === false) { this.rot = Math.sin(this.t / 70) * 3 + (ph === 1 ? -6 : 0); } else if (win === true && ph === 2) { this.bob = -Math.abs(Math.sin(this.t / 150)) * 7; } }
      if (win === true) this.setPose(['thumbs', 'peace', 'hip'][ph]);
      else if (win === false) this.setPose(['shock', 'cross', 'think'][ph]);
      else this.setPose(['think', 'point', 'think2'][ph]);
      if (win !== this.rideWin && win !== null) {
        const flip = this.rideWin !== null; this.rideWin = win; this.rideMsgT = now;
        this.say(win ? pick(flip ? ['WE\'RE BACK 🚀', 'LET\'S GOOO', 'told you 😎'] : ['we\'re winning 😎', 'cozy up here', 'easy money 🧹']) : pick(flip ? ['NOOO come back 😭', 'hold the line pls', 'it\'s fine. it\'s fine.'] : ['uh oh 😬', 'broom going the wrong way', 'pls reverse']), 2400);
        if (win) this.squash(1.12, 0.9); else this.feathers(3);
      } else if (now - this.rideMsgT > 9000) {
        this.rideMsgT = now; const cd = this.rideCD;
        const late = cd !== null && cd < 40;
        this.say(win === true ? pick(late ? ['almost there… 🤞', 'just hold it'] : ['comfy up here', 'this broom flies 📈', 'don\'t touch anything']) : win === false ? pick(late ? ['need a miracle 🪄', 'come ON'] : ['still time…', 'line pls listen to me', 'reverse reverse']) : pick(['watching closely 👀', 'tick tock']), 2200);
      }
    }
    finishRide() {
      let win = this.rideWin; this.go('rideEnd', 0); this.stateT = 0;
      this.onEvent(win ? 'win' : win === false ? 'lose' : 'roundEnd');
      if (win) { this.say(pick(['WE WON 🏆', 'GG EZ 😎', 'cha-ching 💸']), 3000); for (let i = 0; i < 4; i++) setTimeout(() => this.sparkle(true), i * 120); }
      else if (win === false) { this.say(pick(['rugged by a candle 😭', 'next round is ours', 'I need a minute…']), 3000); this.feathers(6); }
      else this.say('round over!', 2000);
    }
    endRide() { const won = this.rideWin && this.state === 'rideEnd'; if (won) setTimeout(() => { if (this.onGround()) { this.go('sign', 4200); this.board.textContent = 'WIN!'; } }, 1200); this.standUp(); this.state = 'air'; this.vx = rnd(-2, 2); this.vy = -4; this.airPose = 'peace'; this.thrown = false; this.plat = null; this.rot = 0; }
    sparkle(big) {
      const f = document.createElement('div'); f.className = 'xot-feather'; f.textContent = pick(big ? ['✨', '🎉', '💸', '✦'] : ['✦', '✧', '·']);
      const x = this.x - this.face * this.w * 0.45 + rnd(-8, 8), y = this.y - this.h * 0.12 + rnd(-6, 6); f.style.left = x + 'px'; f.style.top = y + 'px'; f.style.color = '#ffe27a';
      this.fx.append(f);
      f.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${-this.face * rnd(20, 60)}px, ${rnd(-30, 30)}px) scale(${big ? 1.6 : 0.4})`, opacity: 0 }], { duration: rnd(600, 1100), easing: 'ease-out' }).onfinish = () => f.remove();
    }
    render() {
      const s = this.el.style;
      s.transform = `translate(${this.x - this.w / 2}px, ${this.y - this.h + this.bob}px)`;
      this.body.style.transform = `rotate(${this.rot}deg) scale(${this.sx * this.face}, ${this.sy})`;
      const air = this.plat ? 0 : clamp(((this.plat ? this.plat.y : this.vh) - this.y) / 300, 0, 1);
      const riding = this.state === 'rideIn' || this.state === 'ride' || this.state === 'rideEnd';
      this.el.classList.toggle('riding', riding);
      this.shadow.style.opacity = riding ? 0 : this.plat ? 0.35 : 0.12; this.shadow.style.transform = `scale(${1 - air * 0.5})`;
      // keep bubble readable (never mirrored), clamp inside viewport
      const bx = this.x; const left = bx - this.w / 2; let off = 0; if (left < 60) off = 60 - left; if (left + this.w > this.vw - 60) off = this.vw - 60 - left - this.w;
      this.bubble.style.transform = `translate(calc(-50% + ${off}px), 0)`;
    }
  }
  Deek.probe = (() => { const o = { chartCanvases: Deek.prototype.chartCanvases }; return () => ({ h: Deek.prototype.findTwap.call(o), by: Deek.prototype.findBeatY.call(o) }); })();
  window.XOTDeek = Deek;
})();

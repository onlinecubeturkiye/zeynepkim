// ZY-11 · oyun motoru v2 (vakalar, kilitler, yıldızlar, efektler)
(function () {
  'use strict';

  const CASES = [
    { n: 1,  tag: 'Davranış Kaydı',    alias: 'Hırsız Kedi',           emoji: '🐱', code: '26', grad: 'linear-gradient(135deg,#ff4d9d,#ff8a3d)', glow: 'rgba(255,77,157,.4)' },
    { n: 2,  tag: 'Enerji Raporu',     alias: 'Spastik',               emoji: '⚡', code: '03', grad: 'linear-gradient(135deg,#ffe066,#ff8a3d)', glow: 'rgba(255,210,63,.4)' },
    { n: 3,  tag: 'Stil Analizi',      alias: 'Çakma Gotik',           emoji: '🖤', code: '07', grad: 'linear-gradient(135deg,#9b6bff,#ff4d9d)', glow: 'rgba(155,107,255,.45)' },
    { n: 4,  tag: 'Davranış Kaydı',    alias: 'Lolcu Köpek',           emoji: '🐶', code: '18', grad: 'linear-gradient(135deg,#33e1ff,#4d7cff)', glow: 'rgba(51,225,255,.4)' },
    { n: 5,  tag: 'İştah Raporu',      alias: 'Doymayan',              emoji: '🍗', code: '11', grad: 'linear-gradient(135deg,#ff8a3d,#ff4d5e)', glow: 'rgba(255,138,61,.4)' },
    { n: 6,  tag: 'Lakap Dosyası',     alias: 'Midesiz',               emoji: '🌶️', code: '13', grad: 'linear-gradient(135deg,#ff4d5e,#ff4d9d)', glow: 'rgba(255,77,94,.4)' },
    { n: 7,  tag: 'Saha Gözlemi',      alias: 'Yolda Yürüyemeyen Kız', emoji: '🚶‍♀️', code: '12', grad: 'linear-gradient(135deg,#a6ff4d,#33e1ff)', glow: 'rgba(166,255,77,.35)' },
    { n: 8,  tag: 'Sosyal Anomali',    alias: 'Uzaylı Kedi',           emoji: '👽', code: '06', grad: 'linear-gradient(135deg,#3ddc84,#9b6bff)', glow: 'rgba(61,220,132,.4)' },
    { n: 9,  tag: 'Karakter Analizi',  alias: 'Pisicik Abi',           emoji: '😼', code: '20', grad: 'linear-gradient(135deg,#ff8a3d,#9b6bff)', glow: 'rgba(255,138,61,.35)' },
    { n: 10, tag: 'Sevimlilik Ölçümü', alias: 'Sevimli Kedi',          emoji: '😻', code: '01', grad: 'linear-gradient(135deg,#ff9ed2,#ff4d9d)', glow: 'rgba(255,158,210,.45)' },
    { n: 11, tag: 'Şifre Çözümü',      alias: 'Son Dosya',             emoji: '🗝️', code: null, grad: 'linear-gradient(135deg,#ffe066,#ffb627)', glow: 'rgba(255,210,63,.45)' },
    { n: 12, tag: 'Gizli Dosya',       alias: 'Yıldız Haritası',       emoji: '🌌', code: null, grad: 'linear-gradient(135deg,#33e1ff,#9b6bff,#ff4d9d)', glow: 'rgba(51,225,255,.45)', secret: true },
  ];
  CASES.forEach(c => { c.href = 'vaka' + c.n + '.html'; c.title = c.n + '. Vaka: ' + c.alias; });
  const MAIN = CASES.filter(c => c.code);
  const FULL_CODE = MAIN.map(c => c.code).join('');
  const STARS_NEEDED = MAIN.length * 3; // gizli dosya için 30 yıldız

  // ---------- kayıt ----------
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const K_UNLOCK = 'zy11_unlocked', K_FINAL = 'zy11_final_done', K_STARS = 'zy11_stars', K_SOUND = 'zy11_sound', K_SECRET = 'zy11_secret_done';

  function unlocked() {
    let v; try { v = JSON.parse(store.get(K_UNLOCK) || '[0]'); } catch (e) { v = [0]; }
    if (!Array.isArray(v)) v = [0];
    if (!v.includes(0)) v.push(0);
    return v;
  }
  function unlock(idx) { const v = unlocked(); if (!v.includes(idx)) { v.push(idx); store.set(K_UNLOCK, JSON.stringify(v)); } }
  function isSolved(n) {
    if (n === 11) return store.get(K_FINAL) === 'true';
    if (n === 12) return store.get(K_SECRET) === 'true';
    return store.get('vaka' + n + '_zy11_solved') === 'true';
  }
  function markSolved(n) {
    if (n === 11) store.set(K_FINAL, 'true');
    else if (n === 12) store.set(K_SECRET, 'true');
    else store.set('vaka' + n + '_zy11_solved', 'true');
  }
  function starMap() { try { return JSON.parse(store.get(K_STARS) || '{}') || {}; } catch (e) { return {}; } }
  function stars(n) { const s = starMap()[n] || 0; return s || (isSolved(n) ? 1 : 0); }
  function setStars(n, s) { const m = starMap(); const old = m[n] || 0; if (s > old) { m[n] = s; store.set(K_STARS, JSON.stringify(m)); } return s > old; }
  function totalStars() { return MAIN.reduce((a, c) => a + stars(c.n), 0); }
  function isUnlocked(n) {
    if (n === 12) return totalStars() >= STARS_NEEDED;
    return unlocked().includes(n - 1);
  }
  function resetAll() {
    [K_UNLOCK, K_FINAL, K_STARS, K_SECRET].forEach(store.del);
    CASES.forEach(c => store.del('vaka' + c.n + '_zy11_solved'));
  }

  // ---------- ses & titreşim ----------
  const soundOn = () => store.get(K_SOUND) !== 'off';
  function setSound(on) { store.set(K_SOUND, on ? 'on' : 'off'); }
  let ctx = null;
  function beep(freq, dur, type, vol) {
    if (!soundOn()) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      const t = ctx.currentTime, d = dur || 0.2;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + 0.05);
    } catch (e) {}
  }
  const sfx = {
    tap() { beep(520, 0.06, 'triangle', 0.1); },
    good() { beep(660, 0.08, 'triangle'); setTimeout(() => beep(990, 0.12, 'triangle'), 60); },
    bad() { beep(160, 0.25, 'square', 0.1); buzz(80); },
    win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.22, 'triangle'), i * 110)); },
    star(i) { beep(700 + i * 220, 0.25, 'triangle'); },
    tick() { beep(880, 0.05, 'square', 0.06); },
  };
  function buzz(ms) { try { if (soundOn() && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

  // ---------- parçacıklar ----------
  let fx = null, fxCtx = null, parts = [], fxRaf = null;
  function ensureFx() {
    if (fx) return;
    fx = document.createElement('canvas'); fx.id = 'fx'; document.body.appendChild(fx);
    fxCtx = fx.getContext('2d');
    const size = () => { const r = window.devicePixelRatio || 1; fx.width = innerWidth * r; fx.height = innerHeight * r; fxCtx.setTransform(r, 0, 0, r, 0, 0); };
    size(); addEventListener('resize', size);
  }
  const PALETTE = ['#ff4d9d', '#ffd23f', '#33e1ff', '#a6ff4d', '#9b6bff', '#ff8a3d', '#ffffff'];
  function burst(x, y, opts) {
    ensureFx(); opts = opts || {};
    const n = opts.count || 22, colors = opts.colors || PALETTE;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = (opts.speed || 5) * (0.4 + Math.random());
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (opts.up || 1.5), g: 0.18, life: 1, decay: 0.012 + Math.random() * 0.02,
        size: (opts.size || 5) * (0.6 + Math.random() * 0.8), color: colors[i % colors.length], shape: opts.shape || (Math.random() < 0.5 ? 'star' : 'dot'), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3 });
    }
    runFx();
  }
  function burstAt(el, opts) { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, opts); }
  function confetti(amount) {
    ensureFx();
    const n = amount || 120;
    for (let i = 0; i < n; i++) {
      parts.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.6, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, g: 0.03,
        life: 1, decay: 0.004 + Math.random() * 0.004, size: 6 + Math.random() * 6, color: PALETTE[i % PALETTE.length], shape: 'rect', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.25, wob: Math.random() * 6 });
    }
    runFx();
  }
  function drawStar(c, r) {
    c.beginPath();
    for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, a = i * Math.PI / 5 - Math.PI / 2; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fill();
  }
  function runFx() {
    if (fxRaf) return;
    const step = () => {
      fxCtx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
      for (const p of parts) {
        p.vy += p.g; p.x += p.vx + (p.wob ? Math.sin((p.wob += 0.08)) * 0.8 : 0); p.y += p.vy; p.life -= p.decay; p.rot += p.vr;
        fxCtx.save(); fxCtx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4)); fxCtx.fillStyle = p.color;
        fxCtx.translate(p.x, p.y); fxCtx.rotate(p.rot);
        if (p.shape === 'star') drawStar(fxCtx, p.size);
        else if (p.shape === 'rect') fxCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        else { fxCtx.beginPath(); fxCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2); fxCtx.fill(); }
        fxCtx.restore();
      }
      if (parts.length) fxRaf = requestAnimationFrame(step); else { fxRaf = null; fxCtx.clearRect(0, 0, innerWidth, innerHeight); }
    };
    fxRaf = requestAnimationFrame(step);
  }

  // ---------- küçük yardımcılar ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  let toastT = null;
  function toast(msg) {
    let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2300);
  }
  function floatText(container, x, y, text, bad) {
    const f = document.createElement('div'); f.className = 'float-txt' + (bad ? ' bad' : ''); f.textContent = text;
    f.style.left = x + 'px'; f.style.top = y + 'px'; container.appendChild(f); setTimeout(() => f.remove(), 800);
  }
  function starsHtml(s, total) { let h = '<span class="stars">'; for (let i = 0; i < (total || 3); i++) h += '<i class="' + (i < s ? 'on' : '') + '">⭐</i>'; return h + '</span>'; }
  async function countdown(arena) {
    const c = document.createElement('div'); c.className = 'countdown'; arena.appendChild(c);
    for (const t of ['3', '2', '1', 'BAŞLA!']) {
      c.innerHTML = '<span style="' + (t.length > 1 ? 'font-size:2.6rem' : '') + '">' + t + '</span>';
      t.length > 1 ? beep(1046, 0.25, 'triangle') : sfx.tick();
      await wait(t.length > 1 ? 450 : 620);
    }
    c.remove();
  }
  function arenaMsg(arena, big, text, small) {
    let m = arena.querySelector('.arena-msg');
    if (!big && !text) { if (m) m.remove(); return; }
    if (!m) { m = document.createElement('div'); m.className = 'arena-msg'; arena.appendChild(m); }
    m.innerHTML = (big ? '<div class="big">' + big + '</div>' : '') + '<div>' + (text || '') + '</div>' + (small ? '<small>' + small + '</small>' : '');
  }
  // sayfa arka plandayken oyun duraklasın diye
  function onHidden(fn) { document.addEventListener('visibilitychange', () => { if (document.hidden) fn(); }); }

  // ---------- modal ----------
  function modal(html, opts) {
    opts = opts || {};
    const m = document.createElement('div'); m.className = 'modal on';
    m.innerHTML = '<div class="sheet">' + html + '</div>';
    document.body.appendChild(m);
    const close = () => { m.remove(); if (opts.onClose) opts.onClose(); };
    if (opts.dismiss !== false) m.addEventListener('click', e => { if (e.target === m) close(); });
    return { el: m, close };
  }
  function confirmBox(title, text, okText) {
    return new Promise(res => {
      const md = modal('<h2>' + title + '</h2><p>' + text + '</p><div class="btn-row"><button class="btn ghost" data-a="0">Vazgeç</button><button class="btn" data-a="1">' + (okText || 'Evet') + '</button></div>', { onClose: () => res(false) });
      md.el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { md.el.remove(); res(b.dataset.a === '1'); });
    });
  }

  // ---------- vaka sayfası iskeleti ----------
  let cur = null, curCfg = null;
  function appbar(c, backHref) {
    const s = stars(c.n);
    return '<div class="appbar"><a class="icon-btn" href="' + (backHref || 'index.html') + '" aria-label="Haritaya dön">←</a>' +
      '<div class="title"><small>VAKA ' + String(c.n).padStart(2, '0') + ' · ' + c.tag.toUpperCase() + '</small>' + c.alias + '</div>' +
      (c.code ? '<span class="pill gold" id="barStars">' + starsHtml(s) + '</span>' : '') +
      '<button class="icon-btn" id="soundBtn" aria-label="Ses">' + (soundOn() ? '🔊' : '🔇') + '</button></div>';
  }
  function bindSound() {
    const b = $('#soundBtn'); if (!b) return;
    b.onclick = () => { setSound(!soundOn()); b.textContent = soundOn() ? '🔊' : '🔇'; sfx.tap(); };
  }
  function lockVeil(c) {
    const v = document.createElement('div'); v.className = 'lock-veil';
    const txt = c.n === 12
      ? 'Bu gizli dosya sadece ilk 10 vakadan <b>' + STARS_NEEDED + ' yıldızın hepsini</b> toplayan dedektiflere açılır. Şu an: ' + totalStars() + ' / ' + STARS_NEEDED + ' ⭐'
      : c.n + '. dosyayı açmak için önce ' + (c.n - 1) + '. vakayı çöz ve oradan aldığın kodu haritada gir.';
    v.innerHTML = '<div class="sheet"><div style="font-size:3rem">🔒</div><h2>Bu dosya kilitli</h2><p>' + txt + '</p><a class="btn" href="index.html">🗺 Haritaya dön</a></div>';
    document.body.appendChild(v);
  }

  function page(n, cfg) {
    cfg = cfg || {};
    const c = CASES[n - 1]; cur = c; curCfg = cfg;
    document.documentElement.style.setProperty('--hero-grad', c.grad);
    document.documentElement.style.setProperty('--hero-glow', c.glow);
    const app = $('#app');
    const tpl = $('#mission');
    let html = appbar(c);
    html += '<div class="card hero"><div class="secret-stamp">' + (cfg.stamp || 'GİZLİ') + '</div><div class="hero-emoji">' + c.emoji + '</div>' +
      '<span class="tag">' + c.tag + '</span><h1>Vaka ' + n + ': <em>' + c.alias + '</em></h1><p class="intro">' + (cfg.intro || '') + '</p></div>';
    if (cfg.evidence) {
      html += '<div class="section-label">🔎 Kanıtlar</div><div class="evidence-list">' +
        cfg.evidence.map((e, i) => '<div class="evidence-item"><div class="ev-num">#' + (i + 1) + '</div><div class="ev-text">' + e + '</div></div>').join('') + '</div>';
      if (cfg.verdict) html += '<div class="verdict"><b>SONUÇ ·</b> ' + cfg.verdict + '</div>';
    }
    if (cfg.mission) {
      const m = cfg.mission;
      html += '<div class="section-label">🎮 Görev</div><div class="card mission"><div class="mission-head"><div class="mission-title">' + m.title + '</div></div>' +
        '<p class="mission-sub">' + m.sub + '</p>' +
        (m.goals ? '<div class="star-goals">' + m.goals.map((g, i) => '<span>' + '⭐'.repeat(i + 1) + ' ' + g + '</span>').join('') + '</div>' : '') +
        '<div id="missionBody"></div></div>';
    }
    else if (tpl) html += '<div id="custom"></div>';
    if (c.code) html += '<div class="section-label">🔑 Kod</div><div class="card code-card" id="codeCard"></div>';
    html += '<div class="footer-nav" id="footerNav"></div>';
    app.innerHTML = html;
    if (tpl) (cfg.mission ? $('#missionBody') : $('#custom')).appendChild(tpl.content.cloneNode(true));
    bindSound();
    renderCode(); renderFooter();
    if (!isUnlocked(n)) lockVeil(c);
    if (cfg.init) cfg.init();
  }

  function renderCode() {
    const box = $('#codeCard'); if (!box || !cur) return;
    if (isSolved(cur.n)) {
      box.innerHTML = '<div class="tag">' + cur.n + '. vakanın kodu</div><div class="code-big" style="margin-top:10px">' + cur.code + '</div>' +
        '<p class="code-note">📒 Kod Defteri\'ne kaydedildi. Son dosyanın şifresi 10 kodun yan yana yazılmasıyla oluşur.</p>' +
        '<div style="margin-bottom:6px">En iyi skorun: ' + starsHtml(stars(cur.n)) + '</div>';
    } else {
      box.innerHTML = '<div style="font-size:2rem">🔒</div><p class="locked">Görevi bitirince kod burada belirecek.</p>';
    }
  }
  function nextAction() {
    const next = CASES[cur.n]; // bir sonraki
    if (!next || next.secret || !cur.code) return null;
    return { label: (unlocked().includes(cur.n) ? '' : '🔓 ') + next.n + '. dosyaya geç →', go: () => { unlock(cur.n); location.href = next.href; } };
  }
  function renderFooter() {
    const f = $('#footerNav'); if (!f) return;
    f.innerHTML = '<a class="btn ghost" href="index.html">🗺 Harita</a>';
    const na = isSolved(cur.n) ? nextAction() : null;
    if (na) { const b = document.createElement('button'); b.className = 'btn cool'; b.textContent = na.label; b.onclick = na.go; f.appendChild(b); }
  }

  // Görev bitti → yıldızları kaydet, sonuç ekranını göster
  async function complete(res) {
    res = res || {};
    const n = cur.n, s = Math.max(1, Math.min(3, res.stars || 1));
    const first = !isSolved(n);
    markSolved(n);
    const best = setStars(n, s);
    sfx.win(); confetti(90);
    const na = nextAction();
    const md = modal(
      '<div style="font-family:var(--font-mono);font-size:.7rem;letter-spacing:2px;color:var(--text-faint)">VAKA ' + n + ' · GÖREV TAMAM</div>' +
      '<h2>' + (res.title || ['İdare eder!', 'Çok iyi!', 'Kusursuz!'][s - 1]) + '</h2>' +
      '<div class="result-stars"><i>⭐</i><i>⭐</i><i>⭐</i></div>' +
      (best && !first ? '<div class="new-best">YENİ REKOR!</div>' : '') +
      (res.stats ? '<div class="stats">' + res.stats + '</div>' : '') +
      (res.msg ? '<p>' + res.msg + '</p>' : '') +
      (cur.code ? '<div class="tag">Kodun</div><div class="code-big" style="margin:4px 0 14px">' + cur.code + '</div>' : '') +
      '<div class="btn-row" style="flex-direction:column">' +
      (na ? '<button class="btn block cool" data-a="next">' + na.label + '</button>' : '') +
      '<button class="btn block ghost" data-a="again">🔁 Tekrar oyna' + (s < 3 ? ' (⭐ için)' : '') + '</button></div>',
      { dismiss: false });
    const icons = md.el.querySelectorAll('.result-stars i');
    for (let i = 0; i < 3; i++) {
      await wait(350);
      if (i < s) { icons[i].classList.add('on'); sfx.star(i); burstAt(icons[i], { count: 14, colors: ['#ffd23f', '#fff', '#ffb627'], speed: 4 }); buzz(30); }
      else icons[i].classList.add('dim');
    }
    md.el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      md.el.remove();
      if (b.dataset.a === 'next') na.go();
      else if (curCfg && curCfg.init) { curCfg.init(); const mb = $('#missionBody'); if (mb) mb.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
    const bs = $('#barStars'); if (bs) bs.innerHTML = starsHtml(stars(n));
    renderCode(); renderFooter();
  }

  window.ZY = {
    CASES, MAIN, FULL_CODE, STARS_NEEDED,
    unlocked, unlock, isUnlocked, isSolved, markSolved, stars, setStars, totalStars, resetAll,
    soundOn, setSound, beep, sfx, buzz, burst, burstAt, confetti, toast, shake, floatText, shuffle, wait, $,
    starsHtml, countdown, arenaMsg, onHidden, modal, confirmBox, page, complete, appbar, bindSound,
  };
})();

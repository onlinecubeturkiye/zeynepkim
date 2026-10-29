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

  // =========================================================
  //   META OYUN: profil, pati, XP, rütbe, seri, günlük görev,
  //   başarımlar, rekor modu, dükkan
  // =========================================================
  const K_PROF = 'zy11_profile';
  const RANKS = ['Çaylak Dedektif', 'Stajyer Dedektif', 'Dedektif', 'Kıdemli Dedektif', 'Komiser', 'Başkomiser', 'Müfettiş', 'Baş Müfettiş', 'Ajan ZY', 'Efsane Dedektif'];
  const RANK_E = ['🔍', '📝', '🕵️', '🕵️‍♀️', '🎖️', '🎖️', '🏅', '🏅', '🦸‍♀️', '👑'];

  const ARCADES = [
    { id: 'kedi',    n: 1, e: '🐱', t: 'Sonsuz Kedi Avı',  unit: 'kedi',   d: '30 saniyede kaç kedi yakalarsın? Bomba oyunu bitirir.', daily: 20, pay: 1.5 },
    { id: 'refleks', n: 4, e: '🐶', t: 'Refleks Maratonu', unit: 'tur',    d: 'Hata yapana kadar devam. Her tur biraz daha hızlı.', daily: 10, pay: 4 },
    { id: 'mide',    n: 6, e: '🍕', t: 'Bitmeyen Sofra',   unit: 'yemek',  d: '3 can, sonsuz yemek. Salata gelene kadar ye!', daily: 30, pay: 1.2 },
    { id: 'yol',     n: 7, e: '🚶‍♀️', t: 'Sonsuz Yürüyüş',  unit: 'm',      d: '3 can, bitmeyen kaldırım. Ne kadar uzağa?', daily: 500, pay: 0.08 },
    { id: 'sinyal',  n: 8, e: '👽', t: 'Uzaylı Hafızası',  unit: 'sinyal', d: 'Tek hata hakkı. En uzun diziyi hatırla.', daily: 8, pay: 5 },
  ];

  const THEMES = [
    { id: 'gece',    name: 'Gece Ajansı',   price: 0,   sw: ['#1a1145', '#ff4d9d', '#33e1ff'] },
    { id: 'seker',   name: 'Pembe Şeker',   price: 150, sw: ['#3d1238', '#ff7ac6', '#ffd23f'] },
    { id: 'gotik',   name: 'Kıştan Kışa Gotik', price: 200, sw: ['#0d0a12', '#b31b3c', '#9b6bff'] },
    { id: 'okyanus', name: 'Okyanus',       price: 200, sw: ['#06263d', '#33e1ff', '#a6ff4d'] },
    { id: 'gunbatimi', name: 'Gün Batımı',  price: 250, sw: ['#3a1420', '#ff8a3d', '#ffd23f'] },
    { id: 'altin',   name: 'Altın Dedektif', price: 0,  sw: ['#2a1d05', '#ffd23f', '#fff1b8'], need: 'gizli' },
  ];
  const AVATARS = [['🐱', 0], ['🐶', 40], ['😼', 40], ['🦊', 60], ['🐼', 60], ['🐸', 60], ['🐰', 60], ['🐨', 70], ['🐯', 80], ['👽', 80], ['🦁', 100], ['🦄', 120], ['🐉', 200]];
  const BOX_PRICE = 60;
  const CATS = [
    { id: 'tekir', e: '🐈', a: '', n: 'Tekir Tarık', r: 1 }, { id: 'kara', e: '🐈‍⬛', a: '', n: 'Kara Mırnav', r: 1 },
    { id: 'gulen', e: '😸', a: '', n: 'Gülen Pisi', r: 1 }, { id: 'uyku', e: '😽', a: '💤', n: 'Uykucu', r: 1 },
    { id: 'saskin', e: '🙀', a: '', n: 'Şaşkın Şeker', r: 1 }, { id: 'somurt', e: '😾', a: '', n: 'Somurtkan', r: 1 },
    { id: 'aglak', e: '😿', a: '', n: 'Duygusal Dilek', r: 1 }, { id: 'kahkaha', e: '😹', a: '', n: 'Kahkaha Kedisi', r: 1 },
    { id: 'pamuk', e: '🐱', a: '☁️', n: 'Pamuk', r: 1 }, { id: 'sokak', e: '🐈', a: '🗑️', n: 'Sokak Lordu', r: 1 },
    { id: 'sarman', e: '😺', a: '🧡', n: 'Sarman', r: 1 }, { id: 'kurabiye', e: '🐱', a: '🍪', n: 'Kurabiye', r: 1 },
    { id: 'gotik', e: '🐈‍⬛', a: '🖤', n: 'Gotik Kedi', r: 2 }, { id: 'lolcu', e: '😼', a: '🎮', n: 'Lolcu Kedi', r: 2 },
    { id: 'popeyes', e: '😺', a: '🍗', n: 'Popeyes Kedisi', r: 2 }, { id: 'cigkofte', e: '😸', a: '🌯', n: 'Çiğköfteci', r: 2 },
    { id: 'ufo', e: '🐱', a: '🛸', n: 'Uzaylı Mırnav', r: 2 }, { id: 'monster', e: '😼', a: '🥤', n: 'Monster Kedi', r: 2 },
    { id: 'abi', e: '😼', a: '🛡️', n: 'Pisicik Abi', r: 2 }, { id: 'yuruyus', e: '🐈', a: '🚧', n: 'Tökezleyen Kedi', r: 2 },
    { id: 'altin', e: '🐱', a: '👑', n: 'Altın Kedi', r: 3 }, { id: 'kozmik', e: '🐈‍⬛', a: '🌌', n: 'Kozmik Kedi', r: 3 },
    { id: 'asik', e: '😻', a: '💘', n: 'Aşık Kedi', r: 3 }, { id: 'zeynep', e: '😻', a: '💛', n: 'Zeynep Kedi', r: 3 },
  ];
  const RARITY = ['', 'Sıradan', 'Nadir', 'Efsane'];

  function prof() {
    let p; try { p = JSON.parse(store.get(K_PROF) || '{}') || {}; } catch (e) { p = {}; }
    p.patis = p.patis || 0; p.xp = p.xp || 0;
    p.streak = p.streak || { last: null, count: 0, best: 0 };
    p.daily = p.daily || {}; p.stats = p.stats || {}; p.ach = p.ach || {}; p.arcade = p.arcade || {};
    p.owned = p.owned || {}; p.owned.themes = p.owned.themes || ['gece']; p.owned.avatars = p.owned.avatars || ['🐱']; p.owned.cats = p.owned.cats || {};
    p.theme = p.theme || 'gece'; p.avatar = p.avatar || '🐱';
    return p;
  }
  function saveProf(p) { store.set(K_PROF, JSON.stringify(p)); }
  function applyTheme(id) { document.documentElement.dataset.theme = id || prof().theme; }

  function levelInfo(xp) {
    let lvl = 1, need = 100, acc = 0;
    while (lvl < RANKS.length && xp >= acc + need) { acc += need; lvl++; need = Math.round(need * 1.35); }
    const max = lvl >= RANKS.length;
    return { lvl, name: RANKS[lvl - 1], e: RANK_E[lvl - 1], into: xp - acc, need: max ? 0 : need, pct: max ? 100 : Math.round((xp - acc) / need * 100) };
  }

  // başarım / rütbe bildirimleri: oyunu engellemeyen, üstten kayan şerit
  const pending = []; let showing = false;
  function queueNote(n) { pending.push(n); if (!showing) nextNote(); }
  async function nextNote() {
    const n = pending.shift(); if (!n) { showing = false; return; }
    showing = true;
    const el = document.createElement('div'); el.className = 'note-banner';
    el.innerHTML = '<div class="nb-e">' + n.e + '</div><div class="nb-t"><small>' + n.tag + '</small><b>' + n.t + '</b><span>' + n.d + '</span></div>';
    document.body.appendChild(el);
    sfx.star(2); buzz(40);
    requestAnimationFrame(() => el.classList.add('on'));
    burst(innerWidth / 2, 60, { count: 26, colors: ['#ffd23f', '#fff', '#ff4d9d'], speed: 5 });
    const close = () => { el.classList.remove('on'); setTimeout(() => { el.remove(); nextNote(); }, 350); };
    el.onclick = close; setTimeout(close, 3200);
  }

  let checking = false;
  function reward(patis, xp, reason, quiet) {
    const p = prof(); const before = levelInfo(p.xp).lvl;
    p.patis += patis || 0; p.xp += xp || 0; saveProf(p);
    const after = levelInfo(p.xp);
    if (!quiet && (patis || xp)) toast((reason ? reason + ' · ' : '') + (patis ? '+' + patis + ' 🐾' : '') + (patis && xp ? '  ' : '') + (xp ? '+' + xp + ' XP' : ''));
    if (after.lvl > before) {
      const bonus = 25 * after.lvl; const q = prof(); q.patis += bonus; saveProf(q);
      queueNote({ e: after.e, tag: 'RÜTBE ATLADIN · SEVİYE ' + after.lvl, t: after.name, d: 'Bonus +' + bonus + ' 🐾' });
    }
    refreshHud();
    if (!checking) checkAch();
  }

  function solvedCount() { return MAIN.filter(c => isSolved(c.n)).length + (isSolved(11) ? 1 : 0); }
  const ACH = [
    { id: 'ilk', e: '🔍', t: 'İlk İpucu', d: 'İlk vakayı çöz', c: () => isSolved(1) },
    { id: 'yari', e: '📂', t: 'Yarı Yol', d: '5 vaka çöz', c: () => solvedCount() >= 5 },
    { id: 'final', e: '💌', t: 'Dosya Kapandı', d: 'Son dosyayı çöz', c: () => isSolved(11) },
    { id: 'gizli', e: '🌌', t: 'Altın Dedektif', d: 'Gizli dosyayı çöz', c: () => isSolved(12) },
    { id: 'uc', e: '⭐', t: 'Kusursuz', d: 'Bir vakada 3 yıldız al', c: () => MAIN.some(c => stars(c.n) >= 3) },
    { id: 'otuz', e: '🌟', t: 'Yıldız Avcısı', d: '30 yıldızın hepsini topla', c: () => totalStars() >= STARS_NEEDED },
    { id: 'seri3', e: '🔥', t: 'Isınıyor', d: '3 gün üst üste gel', c: p => p.streak.best >= 3 },
    { id: 'seri7', e: '🔥', t: 'Bir Hafta!', d: '7 günlük seri yap', c: p => p.streak.best >= 7 },
    { id: 'seri30', e: '☄️', t: 'Sadık Dedektif', d: '30 günlük seri yap', c: p => p.streak.best >= 30 },
    { id: 'gunluk1', e: '📅', t: 'Mesai Başladı', d: 'İlk günlük görevi bitir', c: p => (p.stats.daily || 0) >= 1 },
    { id: 'gunluk10', e: '🗓️', t: 'Mesai Canavarı', d: '10 günlük görev bitir', c: p => (p.stats.daily || 0) >= 10 },
    { id: 'kedi100', e: '🐱', t: 'Kedi Kapanı', d: 'Toplam 100 kedi yakala', c: p => (p.stats.cats || 0) >= 100 },
    { id: 'yemek200', e: '🍕', t: 'Kara Delik', d: 'Toplam 200 yemek ye', c: p => (p.stats.foods || 0) >= 200 },
    { id: 'yol2k', e: '🚶‍♀️', t: 'Eskort Ustası', d: 'Toplam 2 km yürüt', c: p => (p.stats.meters || 0) >= 2000 },
    { id: 'gece', e: '🌙', t: 'Gece Nöbeti', d: 'Gece 02:00–04:00 arası oyna', c: p => !!p.stats.night },
    { id: 'oyun50', e: '🎮', t: 'Bağımlı', d: '50 oyun oyna', c: p => (p.stats.plays || 0) >= 50 },
    { id: 'kutu', e: '🎁', t: 'Sürpriz!', d: 'İlk sürpriz kutuyu aç', c: p => Object.keys(p.owned.cats).length >= 1 },
    { id: 'kedi12', e: '📒', t: 'Koleksiyoncu', d: '12 farklı kedi topla', c: p => Object.keys(p.owned.cats).length >= 12 },
    { id: 'kediTam', e: '👑', t: 'Kedi Kraliçesi', d: 'Kedi albümünü tamamla', c: p => Object.keys(p.owned.cats).length >= CATS.length },
    { id: 'stil', e: '🎨', t: 'Stil İkonu', d: 'Yeni bir tema satın al', c: p => p.owned.themes.length >= 2 },
    { id: 'rekor', e: '🏆', t: 'Rekortmen', d: 'Her rekor modunda puan yap', c: p => ARCADES.every(a => (p.arcade[a.id] || 0) > 0) },
    { id: 'rutbe5', e: '🎖️', t: 'Komiser', d: '5. rütbeye ulaş', c: p => levelInfo(p.xp).lvl >= 5 },
    { id: 'efsane', e: '👑', t: 'Efsane', d: 'Son rütbeye ulaş', c: p => levelInfo(p.xp).lvl >= RANKS.length },
  ];
  function checkAch() {
    checking = true;
    try {
      let again = true;
      while (again) {
        again = false;
        const p = prof();
        for (const a of ACH) {
          if (p.ach[a.id] || !a.c(p)) continue;
          p.ach[a.id] = Date.now(); saveProf(p);
          reward(30, 25, null, true);
          queueNote({ e: a.e, tag: 'BAŞARIM AÇILDI', t: a.t, d: a.d + ' · +30 🐾' });
          again = true; break;
        }
      }
    } finally { checking = false; }
  }
  function stat(k, inc) {
    const p = prof(); p.stats[k] = (p.stats[k] || 0) + (inc == null ? 1 : inc);
    const h = new Date().getHours(); if (h >= 2 && h < 4) p.stats.night = 1;
    saveProf(p); if (!checking) checkAch();
  }

  // ---- seri & günlük görev ----
  function today(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return today(d); }
  const STREAK_REWARD = [10, 15, 20, 25, 30, 40, 100];
  function checkIn() {
    const p = prof(), t = today();
    if (p.streak.last === t) return null;
    p.streak.count = p.streak.last === yesterday() ? p.streak.count + 1 : 1;
    p.streak.best = Math.max(p.streak.best, p.streak.count); p.streak.last = t; saveProf(p);
    const day = ((p.streak.count - 1) % 7) + 1, amt = STREAK_REWARD[day - 1];
    reward(amt, 10, null, true);
    return { day, amt, count: p.streak.count };
  }
  function arcadeAvailable(a) { return isSolved(a.n); }
  function dailyTask() {
    const p = prof(), t = today();
    if (p.daily.date === t && p.daily.task) return p.daily;
    const pool = [];
    MAIN.forEach(c => { if (isUnlocked(c.n) && c.n !== 9 && c.n !== 3) pool.push({ kind: 'stars', n: c.n, min: stars(c.n) >= 3 ? 3 : (isSolved(c.n) ? 3 : 1) }); });
    ARCADES.forEach(a => { if (arcadeAvailable(a)) pool.push({ kind: 'arcade', id: a.id, min: a.daily }, { kind: 'arcade', id: a.id, min: a.daily }); });
    if (!pool.length) pool.push({ kind: 'stars', n: 1, min: 1 });
    const seed = t.split('-').reduce((a, b) => a * 31 + +b, 7);
    p.daily = { date: t, task: pool[seed % pool.length], done: false }; saveProf(p);
    return p.daily;
  }
  function dailyText(task) {
    if (task.kind === 'stars') { const c = CASES[task.n - 1]; return c.emoji + ' Vaka ' + c.n + ' (' + c.alias + ')' + (task.min > 1 ? ': ' + task.min + ' yıldızla bitir' : ': görevi bitir'); }
    const a = ARCADES.find(x => x.id === task.id); return a.e + ' Rekor Modu · ' + a.t + ': ' + task.min + ' ' + a.unit;
  }
  function dailyHref(task) { if (task.kind === 'stars') return 'vaka' + task.n + '.html'; const a = ARCADES.find(x => x.id === task.id); return 'vaka' + a.n + '.html?rekor=1'; }
  function dailyProgress(kind, key, val) {
    const d = dailyTask(); if (d.done) return;
    const t = d.task;
    const ok = kind === t.kind && (kind === 'stars' ? key === t.n && val >= t.min : key === t.id && val >= t.min);
    if (!ok) return;
    const p = prof(); p.daily.done = true; saveProf(p); stat('daily');
    reward(60, 50, null, true);
    queueNote({ e: '📅', tag: 'GÜNLÜK GÖREV TAMAM', t: 'Mesai bitti!', d: '+60 🐾 · +50 XP · yarın yeni görev' });
  }

  // ---- mini HUD (vaka sayfalarında pati) ----
  function refreshHud() { const el = $('#patiPill'); if (el) el.textContent = '🐾 ' + prof().patis; }

  // ---------- vaka sayfası iskeleti ----------
  let cur = null, curCfg = null, arcadeDef = null;
  function arcadeMode(n) {
    if (!/[?&]rekor=1/.test(location.search)) return null;
    const a = ARCADES.find(x => x.n === n); return a && isSolved(n) ? a : null;
  }
  function appbar(c, arc) {
    const s = stars(c.n);
    return '<div class="appbar"><a class="icon-btn" href="' + (arc ? 'rekor.html' : 'index.html') + '" aria-label="Geri">←</a>' +
      '<div class="title"><small>' + (arc ? 'REKOR MODU' : 'VAKA ' + String(c.n).padStart(2, '0') + ' · ' + c.tag.toUpperCase()) + '</small>' + (arc ? arc.t : c.alias) + '</div>' +
      (arc ? '<span class="pill gold">🏆 ' + (prof().arcade[arc.id] || 0) + '</span>' : c.code ? '<span class="pill gold" id="barStars">' + starsHtml(s) + '</span>' : '') +
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
    applyTheme();
    const c = CASES[n - 1]; cur = c; curCfg = cfg;
    const arc = arcadeDef = arcadeMode(n);
    document.documentElement.style.setProperty('--hero-grad', c.grad);
    document.documentElement.style.setProperty('--hero-glow', c.glow);
    const app = $('#app');
    const tpl = $('#mission');
    let html = appbar(c, arc);
    if (arc) {
      const best = prof().arcade[arc.id] || 0;
      html += '<div class="card hero"><div class="secret-stamp">REKOR</div><div class="hero-emoji">' + arc.e + '</div><span class="tag">Rekor Modu · Vaka ' + n + '</span>' +
        '<h1><em>' + arc.t + '</em></h1><p class="intro">' + arc.d + '</p>' +
        '<div class="btn-row" style="margin-top:12px"><span class="pill gold">🏆 Rekor: ' + best + ' ' + arc.unit + '</span></div></div>';
      html += '<div class="section-label">🎮 Rekor Denemesi</div><div class="card mission"><div id="missionBody"></div></div>';
    } else {
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
      } else if (tpl) html += '<div id="custom"></div>';
      if (c.code) html += '<div class="section-label">🔑 Kod</div><div class="card code-card" id="codeCard"></div>';
    }
    html += '<div class="footer-nav" id="footerNav"></div>';
    app.innerHTML = html;
    if (tpl) (cfg.mission || arc ? $('#missionBody') : $('#custom')).appendChild(tpl.content.cloneNode(true));
    bindSound();
    if (arc) { const f = $('#footerNav'); f.innerHTML = '<a class="btn ghost" href="rekor.html">🏆 Rekor Salonu</a><a class="btn cool" href="vaka' + n + '.html">📂 Vakaya dön</a>'; }
    else { renderCode(); renderFooter(); }
    if (!isUnlocked(n)) lockVeil(c);
    if (cfg.init) cfg.init(arc);
  }

  function renderCode() {
    const box = $('#codeCard'); if (!box || !cur) return;
    if (isSolved(cur.n)) {
      const a = ARCADES.find(x => x.n === cur.n);
      box.innerHTML = '<div class="tag">' + cur.n + '. vakanın kodu</div><div class="code-big" style="margin-top:10px">' + cur.code + '</div>' +
        '<p class="code-note">📒 Kod Defteri\'ne kaydedildi. Son dosyanın şifresi 10 kodun yan yana yazılmasıyla oluşur.</p>' +
        '<div style="margin-bottom:6px">En iyi skorun: ' + starsHtml(stars(cur.n)) + '</div>' +
        (a ? '<a class="btn gold small" style="margin-top:10px" href="vaka' + cur.n + '.html?rekor=1">🏆 Rekor Modu: ' + a.t + '</a>' : '');
    } else {
      box.innerHTML = '<div style="font-size:2rem">🔒</div><p class="locked">Görevi bitirince kod burada belirecek.</p>';
    }
  }
  function nextAction() {
    const next = CASES[cur.n];
    if (!next || next.secret || !cur.code) return null;
    return { label: (unlocked().includes(cur.n) ? '' : '🔓 ') + next.n + '. dosyaya geç →', go: () => { unlock(cur.n); location.href = next.href; } };
  }
  function renderFooter() {
    const f = $('#footerNav'); if (!f) return;
    f.innerHTML = '<a class="btn ghost" href="index.html">🗺 Harita</a>';
    const na = isSolved(cur.n) ? nextAction() : null;
    if (na) { const b = document.createElement('button'); b.className = 'btn cool'; b.textContent = na.label; b.onclick = na.go; f.appendChild(b); }
  }

  // Görev bitti → yıldız, pati, XP, sonuç ekranı
  async function complete(res) {
    res = res || {};
    const n = cur.n, s = Math.max(1, Math.min(3, res.stars || 1));
    const first = !isSolved(n);
    const oldStars = stars(n);
    markSolved(n);
    const best = setStars(n, s);
    let patis = first ? 40 + s * 10 : s * 5, xp = first ? 30 + s * 10 : s * 5;
    if (best && !first) { patis += 15 * (s - oldStars); xp += 10; }
    sfx.win(); confetti(90);
    const na = nextAction();
    const md = modal(
      '<div style="font-family:var(--font-mono);font-size:.7rem;letter-spacing:2px;color:var(--text-faint)">VAKA ' + n + ' · GÖREV TAMAM</div>' +
      '<h2>' + (res.title || ['İdare eder!', 'Çok iyi!', 'Kusursuz!'][s - 1]) + '</h2>' +
      '<div class="result-stars"><i>⭐</i><i>⭐</i><i>⭐</i></div>' +
      (best && !first ? '<div class="new-best">YENİ REKOR!</div>' : '') +
      (res.stats ? '<div class="stats">' + res.stats + '</div>' : '') +
      '<div class="reward-row"><span>+' + patis + ' 🐾</span><span>+' + xp + ' XP</span></div>' +
      (res.msg ? '<p>' + res.msg + '</p>' : '') +
      (cur.code ? '<div class="tag">Kodun</div><div class="code-big" style="margin:4px 0 14px">' + cur.code + '</div>' : '') +
      '<div class="btn-row" style="flex-direction:column">' +
      (na ? '<button class="btn block cool" data-a="next">' + na.label + '</button>' : '') +
      '<button class="btn block ghost" data-a="again">🔁 Tekrar oyna' + (s < 3 ? ' (⭐ için)' : '') + '</button></div>',
      { dismiss: false });
    stat('plays'); stat('wins');
    const icons = md.el.querySelectorAll('.result-stars i');
    for (let i = 0; i < 3; i++) {
      await wait(350);
      if (i < s) { icons[i].classList.add('on'); sfx.star(i); burstAt(icons[i], { count: 14, colors: ['#ffd23f', '#fff', '#ffb627'], speed: 4 }); buzz(30); }
      else icons[i].classList.add('dim');
    }
    md.el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      md.el.remove();
      if (b.dataset.a === 'next') na.go();
      else if (curCfg && curCfg.init) { curCfg.init(null); const mb = $('#missionBody'); if (mb) mb.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
    reward(patis, xp, null, true);
    dailyProgress('stars', n, s);
    const bs = $('#barStars'); if (bs) bs.innerHTML = starsHtml(stars(n));
    renderCode(); renderFooter();
  }

  // Rekor modu bitti → skor kaydet, ödül, sonuç ekranı
  function arcadeEnd(score, extra) {
    const a = arcadeDef; if (!a) return;
    score = Math.max(0, Math.floor(score));
    const p = prof(), old = p.arcade[a.id] || 0, isBest = score > old;
    if (isBest) { p.arcade[a.id] = score; saveProf(p); }
    const patis = Math.min(80, Math.floor(score * a.pay)) + (isBest && old > 0 ? 20 : 0), xp = Math.min(60, Math.floor(score * a.pay * 0.8)) + 5;
    if (isBest) { sfx.win(); confetti(110); } else sfx.good();
    const md = modal(
      '<div style="font-family:var(--font-mono);font-size:.7rem;letter-spacing:2px;color:var(--text-faint)">REKOR MODU · ' + a.t.toUpperCase() + '</div>' +
      '<div style="font-size:3rem;margin-top:6px">' + (isBest ? '🏆' : a.e) + '</div>' +
      '<div class="score-big">' + score + '<small> ' + a.unit + '</small></div>' +
      (isBest ? '<div class="new-best">' + (old ? 'YENİ REKOR!' : 'İLK REKORUN!') + '</div>' : '<div class="stats">Rekorun: ' + old + ' ' + a.unit + '</div>') +
      (extra ? '<div class="stats">' + extra + '</div>' : '') +
      '<div class="reward-row"><span>+' + patis + ' 🐾</span><span>+' + xp + ' XP</span></div>' +
      '<div class="btn-row" style="flex-direction:column"><button class="btn block" data-a="again">🔁 Tekrar dene</button><a class="btn block ghost" href="rekor.html">🏆 Rekor Salonu</a></div>',
      { dismiss: false });
    md.el.querySelector('[data-a=again]').onclick = () => { md.el.remove(); if (curCfg && curCfg.init) curCfg.init(a); };
    stat('plays');
    reward(patis, xp, null, true);
    dailyProgress('arcade', a.id, score);
    const pill = $('.appbar .pill.gold'); if (pill) pill.textContent = '🏆 ' + (prof().arcade[a.id] || 0);
  }

  // ---- dükkan ----
  function buy(kind, id, price) {
    const p = prof();
    if (p.patis < price) { sfx.bad(); toast('Yetersiz pati 🐾 (' + p.patis + '/' + price + ')'); return false; }
    p.patis -= price;
    if (kind === 'theme') { p.owned.themes.push(id); p.theme = id; }
    if (kind === 'avatar') { p.owned.avatars.push(id); p.avatar = id; }
    saveProf(p); sfx.win(); applyTheme(); refreshHud(); checkAch(); return true;
  }
  function openBox() {
    const p = prof();
    if (p.patis < BOX_PRICE) { sfx.bad(); toast('Yetersiz pati 🐾 (' + p.patis + '/' + BOX_PRICE + ')'); return null; }
    p.patis -= BOX_PRICE;
    const roll = Math.random(), r = roll < 0.06 ? 3 : roll < 0.32 ? 2 : 1;
    const pool = CATS.filter(c => c.r === r), cat = pool[Math.floor(Math.random() * pool.length)];
    const dup = !!p.owned.cats[cat.id];
    p.owned.cats[cat.id] = (p.owned.cats[cat.id] || 0) + 1;
    if (dup) p.patis += 20;
    saveProf(p); refreshHud(); checkAch();
    return { cat, dup };
  }
  function catHtml(c, big) { return '<span class="catpic' + (big ? ' big' : '') + '"><span>' + c.e + '</span>' + (c.a ? '<i>' + c.a + '</i>' : '') + '</span>'; }

  function resetAllMeta() { store.del(K_PROF); }

  // hub sayfalarının alt sekme çubuğu
  function tabbar(active) {
    document.body.classList.add('hub');
    const d = dailyTask();
    const tabs = [['index', '🗺', 'Harita'], ['rekor', '🏆', 'Rekorlar'], ['magaza', '🛍', 'Dükkan'], ['profil', '🕵️‍♀️', 'Profil']];
    const nav = document.createElement('nav'); nav.className = 'tabbar';
    nav.innerHTML = tabs.map(([id, e, t]) => '<a href="' + id + '.html" class="' + (id === active ? 'on' : '') + '">' + e +
      (id === 'index' && !d.done ? '<span class="dot"></span>' : '') + '<small>' + t + '</small></a>').join('');
    document.body.appendChild(nav);
  }
  function hubBar() {
    const p = prof(), L = levelInfo(p.xp);
    return '<div class="appbar"><a class="icon-btn" href="profil.html" style="font-size:1.4rem">' + p.avatar + '</a>' +
      '<div class="title"><small>' + L.e + ' SEVİYE ' + L.lvl + (L.need ? ' · ' + L.into + '/' + L.need + ' XP' : ' · MAX') + '</small><div class="xpbar" style="margin-top:4px"><div style="width:' + L.pct + '%"></div></div></div>' +
      '<span class="pill gold" id="patiPill">🐾 ' + p.patis + '</span>' +
      '<button class="icon-btn" id="soundBtn" aria-label="Ses">' + (soundOn() ? '🔊' : '🔇') + '</button></div>';
  }

  // sayfa açılır açılmaz tema uygula
  applyTheme();

  window.ZY = {
    CASES, MAIN, FULL_CODE, STARS_NEEDED, ARCADES, THEMES, AVATARS, CATS, RARITY, BOX_PRICE, ACH, RANKS, STREAK_REWARD,
    unlocked, unlock, isUnlocked, isSolved, markSolved, stars, setStars, totalStars, solvedCount,
    resetAll: () => { resetAll(); resetAllMeta(); },
    soundOn, setSound, beep, sfx, buzz, burst, burstAt, confetti, toast, shake, floatText, shuffle, wait, $,
    starsHtml, countdown, arenaMsg, onHidden, modal, confirmBox, page, complete, appbar, bindSound,
    prof, saveProf, levelInfo, reward, stat, checkAch, checkIn, dailyTask, dailyText, dailyHref, applyTheme, refreshHud,
    arcadeEnd, arcadeAvailable, buy, openBox, catHtml, queueNote, tabbar, hubBar,
  };
})();

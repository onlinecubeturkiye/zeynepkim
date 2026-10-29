// ZY-11 · ortak oyun motoru (vaka kayıtları, kilitler, kod kutusu, konfeti)
(function () {
  const CASES = [
    { n: 1,  tag: 'Davranış Kaydı',    alias: 'Hırsız Kedi',            emoji: '🐱', code: '26' },
    { n: 2,  tag: 'Enerji Raporu',     alias: 'Spastik',                emoji: '⚡', code: '03' },
    { n: 3,  tag: 'Stil Analizi',      alias: 'Çakma Gotik',            emoji: '🖤', code: '07' },
    { n: 4,  tag: 'Davranış Kaydı',    alias: 'Lolcu Köpek',            emoji: '🐶', code: '18' },
    { n: 5,  tag: 'İştah Raporu',      alias: 'Doymayan',               emoji: '🍗', code: '11' },
    { n: 6,  tag: 'Lakap Dosyası',     alias: 'Midesiz',                emoji: '🌶️', code: '13' },
    { n: 7,  tag: 'Saha Gözlemi',      alias: 'Yolda Yürüyemeyen Kız',  emoji: '🚶‍♀️', code: '12' },
    { n: 8,  tag: 'Sosyal Anomali',    alias: 'Uzaylı Kedi',            emoji: '👽', code: '06' },
    { n: 9,  tag: 'Karakter Analizi',  alias: 'Pisicik Abi',            emoji: '😼', code: '20' },
    { n: 10, tag: 'Sevimlilik Ölçümü', alias: 'Sevimli Kedi',           emoji: '😻', code: '01' },
    { n: 11, tag: 'Şifre Çözümü',      alias: 'Son Dosya',              emoji: '🗝️', code: null },
  ];
  CASES.forEach(c => { c.href = 'vaka' + c.n + '.html'; c.title = c.n + '. Vaka: ' + c.alias; });
  const FULL_CODE = CASES.filter(c => c.code).map(c => c.code).join('');

  const UNLOCK_KEY = 'zy11_unlocked';
  const FINAL_KEY = 'zy11_final_done';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  function unlocked() {
    let v;
    try { v = JSON.parse(store.get(UNLOCK_KEY) || '[0]'); } catch (e) { v = [0]; }
    if (!Array.isArray(v)) v = [0];
    if (!v.includes(0)) v.push(0);
    return v;
  }
  function unlock(idx) {
    const v = unlocked();
    if (!v.includes(idx)) { v.push(idx); store.set(UNLOCK_KEY, JSON.stringify(v)); }
  }
  const isUnlocked = n => unlocked().includes(n - 1);
  const isSolved = n => n === 11 ? store.get(FINAL_KEY) === 'true' : store.get('vaka' + n + '_zy11_solved') === 'true';
  function markSolved(n) {
    if (n === 11) store.set(FINAL_KEY, 'true');
    else store.set('vaka' + n + '_zy11_solved', 'true');
  }
  function resetAll() {
    store.del(UNLOCK_KEY); store.del(FINAL_KEY);
    CASES.forEach(c => store.del('vaka' + c.n + '_zy11_solved'));
  }

  function confetti(emojis, count) {
    emojis = emojis || ['🐾', '✨', '💛', '🎉'];
    count = count || 16;
    for (let i = 0; i < count; i++) {
      const c = document.createElement('div');
      c.className = 'confetti-piece';
      c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      c.style.left = Math.random() * 100 + 'vw';
      c.style.animationDuration = (Math.random() * 2 + 2) + 's';
      c.style.animationDelay = (Math.random() * 0.4) + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4800);
    }
  }

  let toastTimer = null;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  let audioCtx = null;
  function beep(freq, dur, type) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.25));
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + (dur || 0.25) + 0.05);
    } catch (e) {}
  }

  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

  function topbar(n) {
    const bar = document.createElement('div');
    bar.className = 'topbar';
    const dots = CASES.map(c => {
      const cls = c.n === n ? 'cur' : (isSolved(c.n) ? 'on' : '');
      return '<i class="' + cls + '" title="' + c.title + '"></i>';
    }).join('');
    bar.innerHTML = '<a href="index.html">← Dosyalar</a><div class="dots">' + dots + '</div>';
    return bar;
  }

  function lockVeil(n) {
    const v = document.createElement('div');
    v.className = 'lock-veil';
    v.innerHTML =
      '<div class="lock-card"><div class="big">🔒</div><h2>Bu dosya hâlâ kilitli</h2>' +
      '<p>' + n + '. dosyayı açmak için önce ' + (n - 1) + '. vakayı çöz ve oradan aldığın kodu ana sayfada gir.</p>' +
      '<a class="btn btn-red" href="index.html">Dosyalara dön</a></div>';
    document.body.appendChild(v);
  }

  // Her vaka sayfası: ZY.page(n, { init, solvedText }) çağırır.
  // #gameArea → oyunun kendisi, #gameWin → kazanma mesajı, #codeBox → kod kutusu
  let current = null;
  function page(n, opts) {
    opts = opts || {};
    const c = CASES[n - 1];
    current = c;
    const board = document.querySelector('.board');
    board.insertBefore(topbar(n), board.firstChild);
    if (!isUnlocked(n)) lockVeil(n);
    if (n === 11) return;

    const box = document.getElementById('codeBox');
    const next = CASES[n];
    box.className = 'code-box';
    box.innerHTML =
      '<p id="codePrompt">Kodu görmek için önce yukarıdaki görevi bitir.</p>' +
      '<button class="btn btn-red" id="revealBtn" disabled>🔒 Önce Görevi Bitir</button>' +
      '<div class="code-display" id="codeDisplay">' + c.code + '</div>' +
      '<div class="code-after" id="codeAfter">' +
        '<p class="note">✅ Bu kod <b>Kod Defteri</b>\'ne kaydedildi. Yine de bir yere not al: 11. dosyanın şifresi 10 kodun birleşimi!</p>' +
        '<button class="btn btn-gold" id="nextBtn">🔓 Kodu kullan, ' + next.n + '. dosyayı aç →</button>' +
      '</div>';
    document.getElementById('revealBtn').addEventListener('click', reveal);
    document.getElementById('nextBtn').addEventListener('click', () => {
      unlock(n);
      location.href = next.href;
    });

    const area = document.getElementById('gameArea');
    const win = document.getElementById('gameWin');
    const sub = document.querySelector('.game-sub');
    if (isSolved(n)) {
      const original = sub ? sub.textContent : '';
      if (area) area.style.display = 'none';
      if (sub) sub.textContent = 'Bu görevi zaten tamamlamıştın ✅';
      win.style.display = 'block';
      win.innerHTML = '✅ Görev tamam, kod hazır. ';
      const again = document.createElement('button');
      again.className = 'btn btn-dark';
      again.style.cssText = 'font-size:0.8rem;padding:6px 14px;margin-left:6px;';
      again.textContent = '🔁 Tekrar oyna';
      again.onclick = () => {
        win.style.display = 'none';
        if (sub) sub.textContent = original;
        if (area) area.style.display = '';
        if (opts.init) opts.init();
      };
      win.appendChild(again);
      enableReveal();
    } else if (opts.init) {
      opts.init();
    }
  }

  function enableReveal() {
    const btn = document.getElementById('revealBtn');
    if (!btn) return;
    document.getElementById('codePrompt').textContent = 'Görev tamam! Kodu görmek için tıkla:';
    btn.disabled = false;
    btn.textContent = '🔍 Kodu Ortaya Çıkar';
  }

  function reveal() {
    const btn = document.getElementById('revealBtn');
    if (btn.disabled) return;
    btn.style.display = 'none';
    document.getElementById('codePrompt').textContent = (current ? current.n : '') + '. vakanın kodu:';
    document.getElementById('codeDisplay').style.display = 'block';
    document.getElementById('codeAfter').style.display = 'block';
    beep(660, 0.15); setTimeout(() => beep(990, 0.25), 140);
    confetti();
  }

  function win(n, message) {
    markSolved(n);
    const w = document.getElementById('gameWin');
    if (w) { w.textContent = message || '🎉 Görev tamam, kod artık senin!'; w.style.display = 'block'; }
    enableReveal();
    confetti(['🐾', '✨', '⭐'], 10);
    const box = document.getElementById('codeBox');
    if (box) setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  window.ZY = { CASES, FULL_CODE, unlocked, unlock, isUnlocked, isSolved, markSolved, resetAll, confetti, toast, beep, shake, page, win, shuffle };
})();

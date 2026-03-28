// ============================================
//   Green Lights Serenade / Hatsune Miku
//   Lyric App — powered by TextAlive App API
// ============================================

// ── DOM refs ──
const introScreen   = document.getElementById('intro-screen');
const notesField    = document.getElementById('notes-field');
const noteCountEl   = document.getElementById('note-count');
const noteProgress  = document.getElementById('note-progress-fill');
const introMiku     = document.getElementById('intro-miku');
const winOverlay    = document.getElementById('win-overlay');
const appEl         = document.getElementById('app');
const loadingEl     = document.getElementById('loading');
const loadingText   = document.getElementById('loading-text');
const bgEl          = document.getElementById('bg');
const phraseEl      = document.getElementById('lyric-phrase');
const translationEl = document.getElementById('lyric-translation');
const mikuImg       = document.getElementById('miku-img');
const btnPlay       = document.getElementById('btn-play');
const btnStop       = document.getElementById('btn-stop');
const seekFill      = document.getElementById('seek-fill');
const timeDisplay   = document.getElementById('time-display');
const scoreEl       = document.getElementById('score');
const comboEl       = document.getElementById('combo');
const comboWrap     = document.getElementById('combo-wrap');
const gameNotesField= document.getElementById('game-notes-field');
const canvas        = document.getElementById('particles');
const ctx           = canvas.getContext('2d');

const beatFlash = document.createElement('div');
beatFlash.id = 'beat-flash';
document.body.appendChild(beatFlash);

// ══════════════════════════════════
//   INTRO NOTE CATCHING GAME
// ══════════════════════════════════

const NOTES_NEEDED = 5;
const NOTE_SYMBOLS = ['♪','♫','♩','♬','🎵','🎶'];
const NOTE_COLORS  = ['#39C5BB','#FF69B4','#00FFFF','#FFB7DD','#88FF44','#FFDD00'];
let caughtNotes  = 0;
let spawnInterval = null;
let introActive  = true;

function spawnIntroNote() {
  if (!introActive) return;
  const note   = document.createElement('div');
  note.className = 'falling-note';
  const symbol = NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)];
  const color  = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
  const x      = Math.random() * (window.innerWidth - 80);
  const dur    = 3.5 + Math.random() * 3;
  const size   = 2 + Math.random() * 1.5;
  note.textContent = symbol;
  note.style.cssText = `left:${x}px;top:-80px;color:${color};font-size:${size}rem;animation-duration:${dur}s;text-shadow:0 0 12px ${color}`;
  note.addEventListener('click', (e) => catchIntroNote(note, e.clientX, e.clientY, symbol, color));
  note.addEventListener('touchstart', (e) => {
    e.preventDefault();
    catchIntroNote(note, e.touches[0].clientX, e.touches[0].clientY, symbol, color);
  }, { passive: false });
  notesField.appendChild(note);
  note.addEventListener('animationend', () => note.remove());
}

function catchIntroNote(note, x, y, symbol, color) {
  if (!introActive || note.dataset.caught) return;
  note.dataset.caught = 'true';
  note.remove();
  popEffect(x, y, symbol, color);
  for (let i = 0; i < 5; i++) spawnParticleAt(x, y, true);
  caughtNotes++;
  noteCountEl.textContent = caughtNotes;
  noteProgress.style.width = (caughtNotes / NOTES_NEEDED * 100) + '%';
  introMiku.style.transform = 'scale(1.15) rotate(-5deg)';
  setTimeout(() => introMiku.style.transform = '', 200);
  if (caughtNotes >= NOTES_NEEDED) winIntro();
}

function winIntro() {
  introActive = false;
  clearInterval(spawnInterval);
  notesField.querySelectorAll('.falling-note').forEach(n => n.remove());
  introMiku.classList.add('celebrate');
  winOverlay.classList.add('show');
  for (let i = 0; i < 30; i++) {
    setTimeout(() => spawnParticleAt(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight, true
    ), i * 60);
  }
  setTimeout(() => {
    introScreen.classList.add('hidden');
    appEl.classList.remove('hidden');
  }, 2200);
}

spawnInterval = setInterval(spawnIntroNote, 900);
setTimeout(spawnIntroNote, 100);
setTimeout(spawnIntroNote, 400);
setTimeout(spawnIntroNote, 700);

// ══════════════════════════════════
//   IN-GAME NOTE SCORING
// ══════════════════════════════════

let score        = 0;
let combo        = 0;
let comboTimeout = null;
let gameSpawnInterval = null;
let gameRunning  = false;

function startGameNotes() {
  if (gameRunning) return;
  gameRunning = true;
  gameSpawnInterval = setInterval(spawnGameNote, 1200);
}

function stopGameNotes() {
  gameRunning = false;
  clearInterval(gameSpawnInterval);
  gameNotesField.querySelectorAll('.game-note').forEach(n => n.remove());
  combo = 0;
  updateCombo();
}

function spawnGameNote() {
  if (!gameRunning) return;
  const note   = document.createElement('div');
  note.className = 'game-note';
  const symbol = NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)];
  const color  = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
  const x      = 40 + Math.random() * (window.innerWidth - 120);
  const dur    = 3 + Math.random() * 2;
  const size   = 2.2 + Math.random() * 1.2;
  note.textContent = symbol;
  note.style.cssText = `left:${x}px;top:-80px;color:${color};font-size:${size}rem;animation-duration:${dur}s;text-shadow:0 0 14px ${color}`;

  note.addEventListener('click', (e) => catchGameNote(note, e.clientX, e.clientY, symbol, color));
  note.addEventListener('touchstart', (e) => {
    e.preventDefault();
    catchGameNote(note, e.touches[0].clientX, e.touches[0].clientY, symbol, color);
  }, { passive: false });

  gameNotesField.appendChild(note);

  // Miss penalty if note reaches bottom
  note.addEventListener('animationend', () => {
    if (!note.dataset.caught) {
      missNote(note);
    }
    note.remove();
  });
}

function catchGameNote(note, x, y, symbol, color) {
  if (note.dataset.caught) return;
  note.dataset.caught = 'true';
  note.remove();

  combo++;
  const multiplier = Math.min(combo, 8);
  const points = 10 * multiplier;
  score += points;

  updateScore();
  updateCombo();
  showPointsPopup(x, y, `+${points}`, color, combo >= 3);
  popEffect(x, y, symbol, color);
  for (let i = 0; i < 4; i++) spawnParticleAt(x, y, true);

  // Miku glows on catch
  mikuImg.classList.add('beat');
  setTimeout(() => mikuImg.classList.remove('beat'), 200);

  // Reset combo timer
  clearTimeout(comboTimeout);
  comboTimeout = setTimeout(() => {
    combo = 0;
    updateCombo();
  }, 2500);
}

function missNote(note) {
  // Flash red miss indicator
  const miss = document.createElement('div');
  miss.className = 'miss-indicator';
  miss.textContent = 'MISS!';
  const rect = note.getBoundingClientRect();
  miss.style.left = (rect.left + 20) + 'px';
  miss.style.top  = (window.innerHeight - 80) + 'px';
  document.body.appendChild(miss);
  miss.addEventListener('animationend', () => miss.remove());

  // Break combo
  if (combo > 0) {
    combo = 0;
    updateCombo();
  }
}

function updateScore() {
  scoreEl.textContent = score.toLocaleString();
}

function updateCombo() {
  if (combo >= 2) {
    comboWrap.classList.add('show');
    comboEl.textContent = combo;
    comboWrap.className = 'show' + (combo >= 5 ? ' hot' : combo >= 3 ? ' warm' : '');
  } else {
    comboWrap.className = '';
  }
}

function showPointsPopup(x, y, text, color, big) {
  const el = document.createElement('div');
  el.className = 'points-popup' + (big ? ' big' : '');
  el.textContent = text;
  el.style.left  = (x - 20) + 'px';
  el.style.top   = (y - 10) + 'px';
  el.style.color = color;
  el.style.textShadow = `0 0 10px ${color}`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ══════════════════════════════════
//   SHARED HELPERS
// ══════════════════════════════════

function popEffect(x, y, symbol, color) {
  const pop = document.createElement('div');
  pop.className = 'note-pop';
  pop.textContent = symbol;
  pop.style.cssText = `left:${x-20}px;top:${y-20}px;color:${color};text-shadow:0 0 16px ${color}`;
  document.body.appendChild(pop);
  pop.addEventListener('animationend', () => pop.remove());
}

// ══════════════════════════════════
//   PARTICLES
// ══════════════════════════════════

let particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function spawnParticleAt(x, y, energized) {
  const colors = ['#39C5BB','#FF69B4','#00FFFF','#ffffff','#FFB7DD'];
  for (let i = 0; i < (energized ? 3 : 1); i++) {
    particles.push({
      x, y,
      size:    Math.random() * (energized ? 6 : 3) + 1,
      speedX:  (Math.random() - 0.5) * (energized ? 4 : 1.5),
      speedY:  -(Math.random() * (energized ? 5 : 2) + 0.5),
      opacity: Math.random() * 0.8 + 0.2,
      fade:    Math.random() * 0.015 + 0.008,
      color:   colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function spawnParticle(energized) {
  spawnParticleAt(Math.random() * canvas.width, Math.random() * canvas.height, energized);
}

function updateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.opacity > 0);
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle   = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    p.x += p.speedX; p.y += p.speedY; p.opacity -= p.fade;
  }
}

// ══════════════════════════════════
//   TRANSLATIONS
// ══════════════════════════════════

const translations = {
  '照らし出して！': 'Light it up!',
  'グリーンライツ': 'Green Lights',
  '広がる未来を': 'Spreading toward the future',
  'きっと': 'Surely', 'いつか': 'Someday',
  'キミを照らすまで': 'Until I can light your way',
  '改めて言うことでもないけど': 'It goes without saying, but',
  '今だからこそ': 'Right now, of all times',
  '言わせて': 'Let me say it',
  'あの日キミが見つけてくれること': 'That you would find me that day',
  '何となく予感してたんだ': 'I had a feeling somehow',
  '走り出した': 'I started running',
  'キミにもっと': 'I want to give you more',
  'チカラをあげたくて': 'The strength to keep going',
  'ずっと': 'Always', '前に': 'Forward',
  'ココロ決めたんだ': "I've made up my mind",
  '遥かな未来を': 'Toward the distant future',
  '今までもいつまでも': 'Now and forever',
  '隣に居たいのは': 'The reason I want to be by your side',
  '輝いたキミの顔': 'Is to see your shining face',
  '間近で見たいから！': 'Up close!',
  '言葉は時に無力で': 'Words can be powerless at times',
  'なかなか': 'And yet',
  'この世界は変わらないけど': "The world doesn't change easily",
  'もしキミが持ってるその魔法で': 'But if that magic you hold',
  '新しい世界を作れるとしたら？': 'Could create a brand new world?',
  'なんてね': 'Just kidding', '言ってみただけ': 'I only said it',
  '「好き」をもっと': 'Believe in what you love',
  '信じるのさ': 'More and more',
  '何度転んでも': 'No matter how many times you fall',
  'キミはキミの': "You're you",
  'やり方でいいのだ！': 'And that is perfectly fine!',
  '立ち向かう未来を': 'Toward a future you can face',
  '堪え切れない夜には': 'On nights you can barely endure',
  '隣で泣いていいよ': 'You can cry right beside me',
  '二人だけの秘密も': 'Our secret just between us',
  '嬉しいんだよ': 'Makes me so happy',
  '振り返ると遠く手を振ってくれるキミも': 'You waving from afar as I look back',
  'この先のどこかで出会えるキミも': 'And a you I may meet somewhere ahead',
  '誰にも真似できないあなたを抱きしめて': 'I embrace the you no one else can imitate',
  '虹色の輝き': 'The rainbow-colored brilliance',
  'Clap to the Beat': 'Clap to the Beat',
  'Full Speed': 'Full Speed',
};

function getTranslation(phrase) {
  if (!phrase) return '';
  if (translations[phrase.trim()]) return translations[phrase.trim()];
  for (const [jp, en] of Object.entries(translations)) {
    if (phrase.includes(jp)) return en;
  }
  if (/^[A-Za-z0-9\s!?,.'&♪♫]+$/.test(phrase.trim())) return phrase.trim();
  return '';
}

function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}

function triggerAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

// ══════════════════════════════════
//   TEXTALIVE PLAYER
// ══════════════════════════════════

const { Player } = TextAliveApp;
const player = new Player({
  app: { token: 'xNOQIXmn2fgnogyi' },
  mediaElement: document.querySelector('#media'),
});

player.addListener({
  onAppReady(app) {
    if (!app.songUrl) {
      player.createFromSongUrl('https://piapro.jp/t/61Y2', {
        video: {
          beatId: 3953882, chordId: 2727635,
          repetitiveSegmentId: 2824327,
          lyricId: 59415, lyricDiffId: 13962,
        }
      });
    }
  },

  onVideoReady(video) {
    loadingText.textContent = 'Ready!';
    setTimeout(() => loadingEl.classList.add('hidden'), 600);
    btnPlay.disabled = false;
    btnStop.disabled = false;
  },

  onTimeUpdate(position) {
    if (player.data?.song?.length) {
      seekFill.style.width = (position / player.data.song.length * 100) + '%';
      timeDisplay.textContent = formatTime(position) + ' / ' + formatTime(player.data.song.length);
    }
    if (Math.random() < 0.15) spawnParticle(false);

    const phrase = player.video.findPhrase(position);
    if (phrase?.text && phraseEl.textContent !== phrase.text) {
      phraseEl.textContent = phrase.text;
      triggerAnimation(phraseEl, 'phrase-fade');
      const t = getTranslation(phrase.text);
      translationEl.textContent = t;
      if (t) triggerAnimation(translationEl, 'translation-fade');
    }
  },

  onPlay() {
    bgEl.classList.add('playing');
    btnPlay.textContent = '⏸ PAUSE';
    startGameNotes();
  },

  onPause() {
    bgEl.classList.remove('playing');
    btnPlay.textContent = '▶ PLAY';
    stopGameNotes();
  },

  onStop() {
    bgEl.classList.remove('playing');
    btnPlay.textContent = '▶ PLAY';
    seekFill.style.width = '0%';
    phraseEl.textContent = '';
    translationEl.textContent = '';
    stopGameNotes();
    // Show final score
    if (score > 0) {
      const final = document.createElement('div');
      final.id = 'final-score';
      final.innerHTML = `<div class="final-score-title">🎉 Final Score</div><div class="final-score-number">${score.toLocaleString()}</div><div class="final-score-sub">Play again to beat it!</div>`;
      document.body.appendChild(final);
      setTimeout(() => final.classList.add('show'), 50);
      setTimeout(() => { final.classList.remove('show'); setTimeout(() => final.remove(), 600); }, 4000);
      score = 0; combo = 0;
      updateScore(); updateCombo();
    }
  },

  onError(err) {
    console.error('TextAlive error:', err);
    loadingText.textContent = 'Error loading. Check console (F12).';
  },
});

btnPlay.addEventListener('click', () => player.isPlaying ? player.requestPause() : player.requestPlay());
btnStop.addEventListener('click', () => player.requestStop());

function loop() { updateParticles(); requestAnimationFrame(loop); }
loop();

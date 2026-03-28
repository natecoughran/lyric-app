// ============================================
//   Green Lights Serenade / Hatsune Miku
// ============================================

// ── DOM refs ──
const bgEl           = document.getElementById('bg');
const introScreen    = document.getElementById('intro-screen');
const notesField     = document.getElementById('notes-field');
const noteCountEl    = document.getElementById('note-count');
const noteProgress   = document.getElementById('note-progress-fill');
const introMiku      = document.getElementById('intro-miku');
const letsGoScreen   = document.getElementById('lets-go-screen');
const btnLetsGoPlay  = document.getElementById('btn-lets-go-play');
const levelTransition= document.getElementById('level-transition');
const transitionText = document.getElementById('transition-text');
const transitionSub  = document.getElementById('transition-sub');
const level1Screen   = document.getElementById('level1-screen');
const level2Screen   = document.getElementById('level2-screen');
const loadingEl      = document.getElementById('loading');
const loadingText    = document.getElementById('loading-text');
// Level 1
const l1Miku         = document.getElementById('level1-miku');
const btnPlayPause   = document.getElementById('btn-play-pause');
const btnStop        = document.getElementById('btn-stop');
const seekFill       = document.getElementById('seek-fill');
const timeDisplay    = document.getElementById('time-display');
const scoreEl        = document.getElementById('score');
const quizQNum       = document.getElementById('quiz-q-num');
const quizProgressFill = document.getElementById('quiz-progress-fill');
const quizQuestion   = document.getElementById('quiz-question');
const quizAnswers    = document.getElementById('quiz-answers');
const quizFeedback   = document.getElementById('quiz-feedback');
const quizBonusScore = document.getElementById('quiz-bonus-score');
const quizDoneMsg    = document.getElementById('quiz-done-msg');
// Level 2
const l2Miku         = document.getElementById('level2-miku');
const btn2PlayPause  = document.getElementById('btn2-play-pause');
const btn2Stop       = document.getElementById('btn2-stop');
const seekFill2      = document.getElementById('seek-fill2');
const timeDisplay2   = document.getElementById('time-display2');
const score2El       = document.getElementById('score2');
const combo2Wrap     = document.getElementById('combo2-wrap');
const combo2El       = document.getElementById('combo2');
const arrowHint      = document.getElementById('arrow-hint');
const arrowTarget    = document.getElementById('arrow-target');
const arrowTimerBar  = document.getElementById('arrow-timer-bar');
const ratingDisplay  = document.getElementById('rating-display');
const canvas         = document.getElementById('particles');
const ctx            = canvas.getContext('2d');

const beatFlash = document.createElement('div');
beatFlash.id = 'beat-flash';
document.body.appendChild(beatFlash);

// ══════════════════════════════════
//   GAME STATE
// ══════════════════════════════════

let currentLevel = 0; // 0=intro, 1=level1, 2=level2
let score        = 0;
let score2       = 0;
let combo2       = 0;
let combo2Timeout = null;
let playerReady  = false;
let playWhenReady = false;

// ══════════════════════════════════
//   QUIZ DATA (Level 1)
// ══════════════════════════════════

const QUIZ_QUESTIONS = [
  { question: "What color is Hatsune Miku's hair?",
    answers: ["Pink","Teal / Cyan","Purple","Blue"], correct: 1 },
  { question: 'What does "Hatsune Miku" roughly mean in Japanese?',
    answers: ["Dancing Princess","First Sound of the Future","Green Light Singer","Voice of the Stars"], correct: 1 },
  { question: "What kind of software is Hatsune Miku?",
    answers: ["A video game character","A real singer","A voice synthesizer","A cartoon character"], correct: 2 },
  { question: "What is the name of Miku's iconic head accessory?",
    answers: ["Headphones","A crown","A headset / microphone unit","Cat ears"], correct: 2 },
];

const QUIZ_CORRECT_BONUS = 200;
const QUIZ_WRONG_PENALTY = -100;
let currentQuestion = 0;
let quizBonusTotal  = 0;
let quizAnswered    = false;
let quizComplete    = false;

function loadQuestion(index) {
  const q = QUIZ_QUESTIONS[index];
  quizAnswered = false; currentQuestion = index;
  quizQNum.textContent = index + 1;
  quizProgressFill.style.width = (index / QUIZ_QUESTIONS.length * 100) + '%';
  quizQuestion.style.opacity = '0'; quizQuestion.style.transform = 'translateY(8px)';
  setTimeout(() => {
    quizQuestion.textContent = q.question;
    quizQuestion.style.transition = 'opacity 0.3s,transform 0.3s';
    quizQuestion.style.opacity = '1'; quizQuestion.style.transform = 'translateY(0)';
  }, 80);
  quizFeedback.textContent = ''; quizFeedback.className = '';
  quizAnswers.innerHTML = '';
  q.answers.forEach((answer, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-answer-btn';
    btn.textContent = answer;
    btn.style.opacity = '0'; btn.style.transform = 'translateY(6px)';
    btn.addEventListener('click', () => handleAnswer(i, btn));
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); handleAnswer(i, btn); }, { passive: false });
    quizAnswers.appendChild(btn);
    setTimeout(() => {
      btn.style.transition = 'opacity 0.25s,transform 0.25s,background 0.15s,border-color 0.15s,box-shadow 0.15s';
      btn.style.opacity = '1'; btn.style.transform = 'translateY(0)';
    }, 120 + i * 70);
  });
}

function handleAnswer(selectedIndex, btn) {
  if (quizAnswered || quizComplete) return;
  quizAnswered = true;
  const q = QUIZ_QUESTIONS[currentQuestion];
  const allBtns = quizAnswers.querySelectorAll('.quiz-answer-btn');
  allBtns.forEach(b => b.classList.add('disabled'));
  const isCorrect = selectedIndex === q.correct;
  if (isCorrect) {
    btn.classList.remove('disabled'); btn.classList.add('correct');
    quizBonusTotal += QUIZ_CORRECT_BONUS;
    quizFeedback.textContent = `✓ Correct! +${QUIZ_CORRECT_BONUS} bonus points!`;
    quizFeedback.className = 'correct';
    l1Miku.classList.add('beat'); setTimeout(() => l1Miku.classList.remove('beat'), 400);
    for (let i = 0; i < 10; i++) spawnParticleAt(Math.random()*window.innerWidth, Math.random()*window.innerHeight, true);
  } else {
    btn.classList.remove('disabled'); btn.classList.add('wrong');
    allBtns[q.correct].classList.remove('disabled'); allBtns[q.correct].classList.add('reveal');
    quizBonusTotal += QUIZ_WRONG_PENALTY;
    quizFeedback.textContent = `✗ Not quite! ${QUIZ_WRONG_PENALTY} points`;
    quizFeedback.className = 'wrong';
    const flash = document.createElement('div'); flash.className = 'penalty-flash';
    document.body.appendChild(flash); flash.addEventListener('animationend', () => flash.remove());
  }
  quizBonusScore.textContent = quizBonusTotal >= 0 ? `+${quizBonusTotal}` : `${quizBonusTotal}`;
  quizBonusScore.style.color = quizBonusTotal >= 0 ? 'var(--l1-green)' : '#ff4444';
  addScore(isCorrect ? QUIZ_CORRECT_BONUS : QUIZ_WRONG_PENALTY);

  setTimeout(() => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      quizAnswers.style.opacity = '0'; quizQuestion.style.opacity = '0'; quizFeedback.style.opacity = '0';
      setTimeout(() => {
        quizAnswers.style.opacity = '1'; quizQuestion.style.opacity = '1'; quizFeedback.style.opacity = '1';
        loadQuestion(currentQuestion + 1);
      }, 350);
    } else {
      quizComplete = true;
      quizProgressFill.style.width = '100%';
      quizQuestion.textContent = ''; quizAnswers.innerHTML = ''; quizFeedback.textContent = '';
      quizDoneMsg.classList.remove('hidden');
      // Transition to Level 2 after a short pause
      setTimeout(() => goToLevel2(), 2500);
    }
  }, 1800);
}

// ══════════════════════════════════
//   LEVEL 2 — BEAT-SYNCED BOXING
// ══════════════════════════════════

const ARROWS = ['↑','↓','←','→'];
const ARROW_KEYS = { ArrowUp:'↑', ArrowDown:'↓', ArrowLeft:'←', ArrowRight:'→' };
const KEY_IDS    = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
const ARROW_TO_KEY = { '↑':'ArrowUp','↓':'ArrowDown','←':'ArrowLeft','→':'ArrowRight' };

let currentArrow    = null;
let arrowShownAt    = null;
let arrowWindow     = 600; // ms to hit the arrow
let arrowTimerHandle = null;
let arrowTimerAnimHandle = null;
let l2Active        = false;
const PERFECT_MS    = 100;
const GOOD_MS       = 280;

function goToLevel2() {
  // Show transition screen
  transitionText.textContent = '⚡ Level 2 ⚡';
  transitionSub.textContent  = 'Shadow Boxing! Hit the arrows!';
  levelTransition.classList.remove('hidden');

  setTimeout(() => {
    levelTransition.classList.add('hidden');
    level1Screen.classList.add('hidden');
    level2Screen.classList.remove('hidden');
    document.body.classList.remove('level1');
    document.body.classList.add('level2');
    currentLevel = 2;
    l2Active = true;
    arrowHint.textContent = 'Hit the arrow key!';
    // Trigger first arrow shortly
    setTimeout(showNextArrow, 800);
  }, 2800);
}

function showNextArrow() {
  if (!l2Active || !player.isPlaying) return;
  currentArrow = ARROWS[Math.floor(Math.random() * ARROWS.length)];
  arrowShownAt = performance.now();
  arrowTarget.textContent = currentArrow;
  arrowTarget.className   = '';

  // Animate timer bar draining
  arrowTimerBar.style.transition = 'none';
  arrowTimerBar.style.transform  = 'scaleX(1)';
  void arrowTimerBar.offsetWidth;
  arrowTimerBar.style.transition = `transform ${arrowWindow}ms linear`;
  arrowTimerBar.style.transform  = 'scaleX(0)';

  // Miss if not hit in time
  clearTimeout(arrowTimerHandle);
  arrowTimerHandle = setTimeout(() => {
    if (currentArrow) registerMiss();
  }, arrowWindow);
}

function registerHit(key) {
  if (!l2Active || !currentArrow) return;
  const expected = ARROW_TO_KEY[currentArrow];
  if (key !== expected) {
    registerMiss(); return;
  }
  const elapsed = performance.now() - arrowShownAt;
  clearTimeout(arrowTimerHandle);
  currentArrow = null;

  // Flash key indicator
  highlightKey(key);

  if (elapsed <= PERFECT_MS) {
    showRating('PERFECT ✦', 'perfect');
    addScore2(150 * Math.min(combo2 + 1, 8));
    combo2++;
    arrowTarget.classList.add('hit-perfect');
    l2Miku.classList.add('hit-perfect');
    setTimeout(() => { arrowTarget.classList.remove('hit-perfect'); l2Miku.classList.remove('hit-perfect'); }, 300);
    for (let i = 0; i < 8; i++) spawnParticleAt(Math.random()*window.innerWidth, Math.random()*window.innerHeight, true);
  } else {
    showRating('GOOD ✓', 'good');
    addScore2(75 * Math.min(combo2 + 1, 8));
    combo2++;
    arrowTarget.classList.add('hit-good');
    l2Miku.classList.add('hit-good');
    setTimeout(() => { arrowTarget.classList.remove('hit-good'); l2Miku.classList.remove('hit-good'); }, 300);
    for (let i = 0; i < 4; i++) spawnParticleAt(Math.random()*window.innerWidth, Math.random()*window.innerHeight, true);
  }

  updateCombo2();
  clearTimeout(combo2Timeout);
  combo2Timeout = setTimeout(() => { combo2 = 0; updateCombo2(); }, 3000);

  // Next arrow
  setTimeout(showNextArrow, 600 + Math.random() * 400);
}

function registerMiss() {
  if (!l2Active) return;
  currentArrow = null;
  clearTimeout(arrowTimerHandle);
  arrowTimerBar.style.transition = 'none';
  arrowTimerBar.style.transform  = 'scaleX(0)';
  showRating('MISS ✗', 'miss');
  arrowTarget.classList.add('hit-miss');
  l2Miku.classList.add('hit-miss');
  setTimeout(() => { arrowTarget.classList.remove('hit-miss'); l2Miku.classList.remove('hit-miss'); }, 350);
  if (combo2 > 0) { combo2 = 0; updateCombo2(); }
  setTimeout(showNextArrow, 800 + Math.random() * 400);
}

function showRating(text, cls) {
  ratingDisplay.textContent = text;
  ratingDisplay.className = cls;
  clearTimeout(ratingDisplay._timeout);
  ratingDisplay._timeout = setTimeout(() => { ratingDisplay.textContent = ''; ratingDisplay.className = ''; }, 900);
}

function highlightKey(keyCode) {
  const map = { ArrowUp:'↑', ArrowDown:'↓', ArrowLeft:'←', ArrowRight:'→' };
  const arrow = map[keyCode];
  const keys  = document.querySelectorAll('.key');
  keys.forEach(k => { if (k.textContent === arrow) { k.classList.add('active'); setTimeout(() => k.classList.remove('active'), 200); }});
}

function addScore2(points) {
  score2 += points;
  score2El.textContent = score2.toLocaleString();
  score2El.classList.toggle('negative', score2 < 0);
}

function updateCombo2() {
  if (combo2 >= 2) {
    combo2Wrap.classList.remove('hidden');
    combo2Wrap.className = (combo2 >= 5 ? 'hot' : combo2 >= 3 ? 'warm' : '');
    combo2El.textContent = combo2;
  } else {
    combo2Wrap.classList.add('hidden');
  }
}

// Keyboard handler
document.addEventListener('keydown', (e) => {
  if (currentLevel === 2 && ARROW_KEYS[e.key]) {
    e.preventDefault();
    registerHit(e.key);
  }
});

// ══════════════════════════════════
//   INTRO NOTE CATCHING
// ══════════════════════════════════

const NOTES_NEEDED = 5;
const NOTE_SYMBOLS = ['♪','♫','♩','♬','🎵','🎶'];
const NOTE_COLORS  = ['#39C5BB','#FF69B4','#00FFFF','#FFB7DD','#88FF44','#FFDD00'];
let caughtNotes   = 0;
let spawnInterval = null;
let introActive   = true;

function spawnIntroNote() {
  if (!introActive) return;
  const note = document.createElement('div');
  note.className = 'falling-note';
  const symbol = NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)];
  const color  = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
  const x      = Math.random() * (window.innerWidth - 80);
  const dur    = 3.5 + Math.random() * 3;
  const size   = 2 + Math.random() * 1.5;
  note.textContent = symbol;
  note.style.cssText = `left:${x}px;top:-80px;color:${color};font-size:${size}rem;animation-duration:${dur}s;text-shadow:0 0 12px ${color}`;
  note.addEventListener('click', (e) => catchIntroNote(note, e.clientX, e.clientY, symbol, color));
  note.addEventListener('touchstart', (e) => { e.preventDefault(); catchIntroNote(note, e.touches[0].clientX, e.touches[0].clientY, symbol, color); }, { passive: false });
  notesField.appendChild(note);
  note.addEventListener('animationend', () => note.remove());
}

function catchIntroNote(note, x, y, symbol, color) {
  if (!introActive || note.dataset.caught) return;
  note.dataset.caught = 'true'; note.remove();
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
  letsGoScreen.classList.remove('hidden');
}

btnLetsGoPlay.addEventListener('click', () => {
  letsGoScreen.classList.add('hidden');
  introScreen.classList.add('hidden');
  level1Screen.classList.remove('hidden');
  document.body.classList.add('level1');
  currentLevel = 1;
  loadQuestion(0);
  if (playerReady) { player.requestPlay(); }
  else { playWhenReady = true; }
});

spawnInterval = setInterval(spawnIntroNote, 900);
setTimeout(spawnIntroNote, 100);
setTimeout(spawnIntroNote, 400);
setTimeout(spawnIntroNote, 700);

// ══════════════════════════════════
//   SCORE (Level 1)
// ══════════════════════════════════

function addScore(amount) {
  score += amount;
  scoreEl.textContent = score.toLocaleString();
  scoreEl.classList.toggle('negative', score < 0);
}

// ══════════════════════════════════
//   PARTICLES
// ══════════════════════════════════

let particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function spawnParticleAt(x, y, energized) {
  const colors = currentLevel === 2
    ? ['#00BFFF','#cc66ff','#ffffff','#88ccff','#ddaaff']
    : ['#39C5BB','#FF69B4','#00FFFF','#00ff88','#ffffff'];
  for (let i = 0; i < (energized ? 3 : 1); i++) {
    particles.push({
      x, y,
      size:    Math.random() * (energized ? 6 : 3) + 1,
      speedX:  (Math.random() - 0.5) * (energized ? 5 : 1.5),
      speedY:  -(Math.random() * (energized ? 5 : 2) + 0.5),
      opacity: Math.random() * 0.8 + 0.2,
      fade:    Math.random() * 0.015 + 0.008,
      color:   colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function spawnParticle(e) { spawnParticleAt(Math.random()*canvas.width, Math.random()*canvas.height, e); }

function updateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.opacity > 0);
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    p.x += p.speedX; p.y += p.speedY; p.opacity -= p.fade;
  }
}

function popEffect(x, y, symbol, color) {
  const pop = document.createElement('div');
  pop.className = 'note-pop';
  pop.textContent = symbol;
  pop.style.cssText = `left:${x-20}px;top:${y-20}px;color:${color};text-shadow:0 0 16px ${color}`;
  document.body.appendChild(pop);
  pop.addEventListener('animationend', () => pop.remove());
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
        video: { beatId:3953882, chordId:2727635, repetitiveSegmentId:2824327, lyricId:59415, lyricDiffId:13962 }
      });
    }
  },

  onVideoReady() {
    playerReady = true;
    loadingText.textContent = 'Ready!';
    setTimeout(() => loadingEl.classList.add('hidden'), 500);
    if (playWhenReady) { setTimeout(() => player.requestPlay(), 200); playWhenReady = false; }
  },

  onTimeUpdate(position) {
    const len = player.data?.song?.length;
    if (len) {
      const pct = (position / len * 100) + '%';
      if (currentLevel === 1) {
        seekFill.style.width  = pct;
        timeDisplay.textContent = formatTime(position) + ' / ' + formatTime(len);
      } else if (currentLevel === 2) {
        seekFill2.style.width = pct;
        timeDisplay2.textContent = formatTime(position) + ' / ' + formatTime(len);
      }
    }
    if (Math.random() < 0.08) spawnParticle(false);

    const beat = player.findBeat(position);
    if (beat && Math.abs(position - beat.startTime) < 30) {
      beatFlash.className = '';
      void beatFlash.offsetWidth;
      beatFlash.className = currentLevel === 2 ? 'flash-l2' : 'flash-l1';
      if (currentLevel === 1) { l1Miku.classList.add('beat'); setTimeout(() => l1Miku.classList.remove('beat'), 200); }
    }
  },

  onPlay() {
    if (currentLevel === 1) btnPlayPause.textContent = '⏸ PAUSE';
    if (currentLevel === 2) btn2PlayPause.textContent = '⏸ PAUSE';
  },
  onPause() {
    if (currentLevel === 1) btnPlayPause.textContent = '▶ PLAY';
    if (currentLevel === 2) { btn2PlayPause.textContent = '▶ PLAY'; l2Active = false; }
  },
  onStop() {
    if (currentLevel === 1) btnPlayPause.textContent = '▶ PLAY';
    if (currentLevel === 2) { btn2PlayPause.textContent = '▶ PLAY'; l2Active = false; currentArrow = null; }
    seekFill.style.width = '0%'; seekFill2.style.width = '0%';
    const totalScore = score + score2;
    if (totalScore !== 0) {
      const final = document.createElement('div');
      final.id = 'final-score';
      final.innerHTML = `
        <div class="final-score-title">🎉 Final Score</div>
        <div class="final-score-number ${totalScore >= 0 ? 'positive' : 'negative'}">${totalScore.toLocaleString()}</div>
        <div class="final-score-sub">${totalScore >= 0 ? 'Amazing! Play again to beat it!' : 'Better luck next time!'}</div>`;
      document.body.appendChild(final);
      setTimeout(() => final.classList.add('show'), 50);
      setTimeout(() => { final.classList.remove('show'); setTimeout(() => final.remove(), 600); }, 4500);
    }
  },
  onError(err) { console.error('TextAlive error:', err); loadingText.textContent = 'Error loading. Check console (F12).'; },
});

// Button controls
btnPlayPause.addEventListener('click',  () => player.isPlaying ? player.requestPause() : player.requestPlay());
btnStop.addEventListener('click',       () => player.requestStop());
btn2PlayPause.addEventListener('click', () => {
  if (player.isPlaying) { player.requestPause(); l2Active = false; }
  else { player.requestPlay(); l2Active = true; setTimeout(showNextArrow, 500); }
});
btn2Stop.addEventListener('click', () => player.requestStop());

function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.floor(ms/1000);
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}

function loop() { updateParticles(); requestAnimationFrame(loop); }
loop();

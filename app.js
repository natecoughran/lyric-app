// ============================================
//   Green Lights Serenade / Hatsune Miku
// ============================================

// ── DOM refs ──
const introBg        = document.getElementById('intro-bg');
const levelBg        = document.getElementById('level-bg');
const introScreen    = document.getElementById('intro-screen');
const notesField     = document.getElementById('notes-field');
const noteCountEl    = document.getElementById('note-count');
const noteProgress   = document.getElementById('note-progress-fill');
const introMiku      = document.getElementById('intro-miku');
const letsGoScreen   = document.getElementById('lets-go-screen');
const btnLetsGoPlay  = document.getElementById('btn-lets-go-play');
const level1Screen   = document.getElementById('level1-screen');
const loadingEl      = document.getElementById('loading');
const loadingText    = document.getElementById('loading-text');
const seekFill       = document.getElementById('seek-fill');
const timeDisplay    = document.getElementById('time-display');
const scoreEl        = document.getElementById('score');
const level1Miku     = document.getElementById('level1-miku');
const btnPlayPause   = document.getElementById('btn-play-pause');
const btnStop        = document.getElementById('btn-stop');
const quizQNum       = document.getElementById('quiz-q-num');
const quizProgressFill = document.getElementById('quiz-progress-fill');
const quizQuestion   = document.getElementById('quiz-question');
const quizAnswers    = document.getElementById('quiz-answers');
const quizFeedback   = document.getElementById('quiz-feedback');
const quizBonusScore = document.getElementById('quiz-bonus-score');
const quizDoneMsg    = document.getElementById('quiz-done-msg');
const canvas         = document.getElementById('particles');
const ctx            = canvas.getContext('2d');

const beatFlash = document.createElement('div');
beatFlash.id = 'beat-flash';
document.body.appendChild(beatFlash);

// ══════════════════════════════════
//   QUIZ DATA
// ══════════════════════════════════

const QUIZ_QUESTIONS = [
  {
    question: "What color is Hatsune Miku's hair?",
    answers: ["Pink", "Teal / Cyan", "Purple", "Blue"],
    correct: 1,
  },
  {
    question: 'What does "Hatsune Miku" roughly mean in Japanese?',
    answers: ["Dancing Princess", "First Sound of the Future", "Green Light Singer", "Voice of the Stars"],
    correct: 1,
  },
  {
    question: "What kind of software is Hatsune Miku?",
    answers: ["A video game character", "A real singer", "A voice synthesizer", "A cartoon character"],
    correct: 2,
  },
  {
    question: "What is the name of Miku's iconic head accessory?",
    answers: ["Headphones", "A crown", "A headset / microphone unit", "Cat ears"],
    correct: 2,
  },
];

const QUIZ_CORRECT_BONUS = 200;
const QUIZ_WRONG_PENALTY = -100;

let currentQuestion = 0;
let quizBonusTotal  = 0;
let quizAnswered    = false;
let quizComplete    = false;

function loadQuestion(index) {
  const q = QUIZ_QUESTIONS[index];
  quizAnswered    = false;
  currentQuestion = index;
  quizQNum.textContent = index + 1;
  quizProgressFill.style.width = (index / QUIZ_QUESTIONS.length * 100) + '%';

  quizQuestion.style.opacity = '0';
  quizQuestion.style.transform = 'translateY(8px)';
  setTimeout(() => {
    quizQuestion.textContent = q.question;
    quizQuestion.style.transition = 'opacity 0.3s, transform 0.3s';
    quizQuestion.style.opacity = '1';
    quizQuestion.style.transform = 'translateY(0)';
  }, 80);

  quizFeedback.textContent = '';
  quizFeedback.className = '';
  quizAnswers.innerHTML = '';

  q.answers.forEach((answer, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-answer-btn';
    btn.textContent = answer;
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(6px)';
    btn.addEventListener('click', () => handleAnswer(i, btn));
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); handleAnswer(i, btn); }, { passive: false });
    quizAnswers.appendChild(btn);
    setTimeout(() => {
      btn.style.transition = 'opacity 0.25s, transform 0.25s, background 0.15s, border-color 0.15s, box-shadow 0.15s';
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
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
    btn.classList.remove('disabled');
    btn.classList.add('correct');
    quizBonusTotal += QUIZ_CORRECT_BONUS;
    quizFeedback.textContent = `✓ Correct! +${QUIZ_CORRECT_BONUS} bonus points!`;
    quizFeedback.className = 'correct';
    level1Miku.classList.add('beat');
    setTimeout(() => level1Miku.classList.remove('beat'), 400);
    for (let i = 0; i < 10; i++) spawnParticleAt(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight, true
    );
  } else {
    btn.classList.remove('disabled');
    btn.classList.add('wrong');
    allBtns[q.correct].classList.remove('disabled');
    allBtns[q.correct].classList.add('reveal');
    quizBonusTotal += QUIZ_WRONG_PENALTY;
    quizFeedback.textContent = `✗ Not quite! ${QUIZ_WRONG_PENALTY} points`;
    quizFeedback.className = 'wrong';
    const flash = document.createElement('div');
    flash.className = 'penalty-flash';
    document.body.appendChild(flash);
    flash.addEventListener('animationend', () => flash.remove());
  }

  // Update bonus & score
  quizBonusScore.textContent = quizBonusTotal >= 0 ? `+${quizBonusTotal}` : `${quizBonusTotal}`;
  quizBonusScore.style.color = quizBonusTotal >= 0 ? 'var(--l1-green)' : '#ff4444';
  addScore(isCorrect ? QUIZ_CORRECT_BONUS : QUIZ_WRONG_PENALTY);

  setTimeout(() => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      quizAnswers.style.opacity = '0';
      quizQuestion.style.opacity = '0';
      quizFeedback.style.opacity = '0';
      setTimeout(() => {
        quizAnswers.style.opacity = '1';
        quizQuestion.style.opacity = '1';
        quizFeedback.style.opacity = '1';
        loadQuestion(currentQuestion + 1);
      }, 350);
    } else {
      quizComplete = true;
      quizProgressFill.style.width = '100%';
      quizQuestion.textContent = '';
      quizAnswers.innerHTML = '';
      quizFeedback.textContent = '';
      quizDoneMsg.classList.remove('hidden');
    }
  }, 1800);
}

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
  // Show Let's Go screen
  letsGoScreen.classList.remove('hidden');
}

// ── Let's Go Play button ──
btnLetsGoPlay.addEventListener('click', () => {
  // Swap backgrounds
  introBg.classList.add('hidden');
  levelBg.classList.remove('hidden');
  // Hide Let's Go, show Level 1
  letsGoScreen.classList.add('hidden');
  introScreen.classList.add('hidden');
  level1Screen.classList.remove('hidden');
  // Load quiz
  loadQuestion(0);
  // Start music
  if (playerReady) {
    player.requestPlay();
  } else {
    playWhenReady = true;
  }
});

let playerReady  = false;
let playWhenReady = false;

spawnInterval = setInterval(spawnIntroNote, 900);
setTimeout(spawnIntroNote, 100);
setTimeout(spawnIntroNote, 400);
setTimeout(spawnIntroNote, 700);

// ══════════════════════════════════
//   SCORE
// ══════════════════════════════════

let score = 0;

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
  const colors = ['#39C5BB','#FF69B4','#00FFFF','#00ff88','#ffffff'];
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
    if (playWhenReady) {
      setTimeout(() => player.requestPlay(), 200);
      playWhenReady = false;
    }
  },

  onTimeUpdate(position) {
    if (player.data?.song?.length) {
      seekFill.style.width = (position / player.data.song.length * 100) + '%';
      timeDisplay.textContent = formatTime(position) + ' / ' + formatTime(player.data.song.length);
    }
    if (Math.random() < 0.1) spawnParticle(false);
    const beat = player.findBeat(position);
    if (beat && Math.abs(position - beat.startTime) < 30) {
      beatFlash.classList.remove('flash'); void beatFlash.offsetWidth; beatFlash.classList.add('flash');
      level1Miku.classList.add('beat'); setTimeout(() => level1Miku.classList.remove('beat'), 200);
    }
  },

  onPlay()  { btnPlayPause.textContent = '⏸ PAUSE'; },
  onPause() { btnPlayPause.textContent = '▶ PLAY'; },

  onStop()  {
    btnPlayPause.textContent = '▶ PLAY';
    seekFill.style.width = '0%';
    if (score !== 0) {
      const final = document.createElement('div');
      final.id = 'final-score';
      final.innerHTML = `
        <div class="final-score-title">🎉 Final Score</div>
        <div class="final-score-number ${score >= 0 ? 'positive' : 'negative'}">${score.toLocaleString()}</div>
        <div class="final-score-sub">${score >= 0 ? 'Amazing! Play again to beat it!' : 'Better luck next time!'}</div>`;
      document.body.appendChild(final);
      setTimeout(() => final.classList.add('show'), 50);
      setTimeout(() => { final.classList.remove('show'); setTimeout(() => final.remove(), 600); }, 4500);
      score = 0; scoreEl.textContent = '0'; scoreEl.classList.remove('negative');
    }
  },

  onError(err) {
    console.error('TextAlive error:', err);
    loadingText.textContent = 'Error loading. Check console (F12).';
  },
});

btnPlayPause.addEventListener('click', () => {
  if (player.isPlaying) player.requestPause();
  else player.requestPlay();
});

btnStop.addEventListener('click', () => player.requestStop());

function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.floor(ms/1000);
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}

function loop() { updateParticles(); requestAnimationFrame(loop); }
loop();

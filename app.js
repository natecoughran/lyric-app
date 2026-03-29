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
// Level 3
const level3Screen   = document.getElementById('level3-screen');
const flappyCanvas   = document.getElementById('flappy-canvas');
const flappyCtx      = flappyCanvas.getContext('2d');
const flappyInst     = document.getElementById('flappy-instruction');
const flappyGameover = document.getElementById('flappy-gameover');
const flappyFinalLeeks = document.getElementById('flappy-final-leeks');
const btnFlappyRetry = document.getElementById('btn-flappy-retry');
const score3El       = document.getElementById('score3');
const score3TotalEl  = document.getElementById('score3-total');
// Level 4
const level4Screen   = document.getElementById('level4-screen');
const pacCanvas      = document.getElementById('pac-canvas');
const pacCtx         = pacCanvas ? pacCanvas.getContext('2d') : null;
const score4El       = document.getElementById('score4');
const score4TotalEl  = document.getElementById('score4-total');
const btn4PlayPause  = document.getElementById('btn4-play-pause');
const btn4Stop       = document.getElementById('btn4-stop');
const seekFill4      = document.getElementById('seek-fill4');
const timeDisplay4   = document.getElementById('time-display4');
const pac4Inst       = document.getElementById('pac-instruction');
const pac4Gameover   = document.getElementById('pac-gameover');
const pac4FinalScore = document.getElementById('pac-final-score');
const btnPacRetry    = document.getElementById('btn-pac-retry');
// End screen
const endScreen      = document.getElementById('end-screen');
const endScoreEl     = document.getElementById('end-score');
const endNotesField  = document.getElementById('end-notes-field');
const endHighScoreEl = document.getElementById('end-high-score');
const endStarsEl     = document.getElementById('end-stars');
const endCongrats    = document.getElementById('end-congrats');
const btn3PlayPause  = document.getElementById('btn3-play-pause');
const btn3Stop       = document.getElementById('btn3-stop');
const seekFill3      = document.getElementById('seek-fill3');
const timeDisplay3   = document.getElementById('time-display3');

const beatFlash = document.createElement('div');
beatFlash.id = 'beat-flash';
document.body.appendChild(beatFlash);

// ══════════════════════════════════
//   GAME STATE
// ══════════════════════════════════

let currentLevel = 0; // 0=intro, 1=level1, 2=level2
let highScore    = parseInt(localStorage.getItem('mikuHighScore') || '0');
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
  { question: "In what year was Hatsune Miku first released?",
    answers: ["2004","2007","2009","2012"], correct: 1 },
];

const QUIZ_CORRECT_BONUS = 200;
const QUIZ_WRONG_PENALTY = -100;
let currentQuestion = 0;
let quizBonusTotal  = 0;
let quizAnswered    = false;
let quizComplete    = false;
let quizTimerHandle = null;
let lifeline5050Used = false;
const QUIZ_TIME_MS  = 8000;



function use5050() {
  if (lifeline5050Used || quizAnswered || quizComplete) return;
  lifeline5050Used = true;
  const btn5050 = document.getElementById('btn-5050');
  if (btn5050) { btn5050.disabled = true; btn5050.style.opacity = '0.4'; }
  const q = QUIZ_QUESTIONS[currentQuestion];
  const allBtns = Array.from(quizAnswers.querySelectorAll('.quiz-answer-btn'));
  // Remove 2 wrong answers
  let removed = 0;
  allBtns.forEach((btn, i) => {
    if (i !== q.correct && removed < 2) {
      btn.style.transition = 'opacity 0.4s, transform 0.4s';
      btn.style.opacity = '0'; btn.style.transform = 'scale(0.8)';
      btn.disabled = true; btn.classList.add('disabled');
      removed++;
    }
  });
}

function startQuizTimer() {
  clearTimeout(quizTimerHandle);
  // Animate the timer bar
  const bar = document.getElementById('quiz-timer-bar');
  if (bar) {
    bar.style.transition = 'none';
    bar.style.transform  = 'scaleX(1)';
    void bar.offsetWidth;
    bar.style.transition = `transform ${QUIZ_TIME_MS}ms linear`;
    bar.style.transform  = 'scaleX(0)';
  }
  quizTimerHandle = setTimeout(() => {
    if (!quizAnswered && !quizComplete) {
      // Time's up -- treat as wrong answer, auto-select nothing
      quizAnswered = true;
      const q = QUIZ_QUESTIONS[currentQuestion];
      const allBtns = quizAnswers.querySelectorAll('.quiz-answer-btn');
      allBtns.forEach(b => b.classList.add('disabled'));
      allBtns[q.correct].classList.remove('disabled');
      allBtns[q.correct].classList.add('reveal');
      quizBonusTotal += QUIZ_WRONG_PENALTY;
      quizFeedback.textContent = `⏰ Time's up! ${QUIZ_WRONG_PENALTY} points`;
      quizFeedback.className = 'wrong';
      quizBonusScore.textContent = quizBonusTotal >= 0 ? `+${quizBonusTotal}` : `${quizBonusTotal}`;
      quizBonusScore.style.color = quizBonusTotal >= 0 ? 'var(--l1-green)' : '#ff4444';
      addScore(QUIZ_WRONG_PENALTY);
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
          setTimeout(() => goToLevel2(), 2500);
        }
      }, 1800);
    }
  }, QUIZ_TIME_MS);
}

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
  startQuizTimer();
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
  clearTimeout(quizTimerHandle);
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
      // (Level 2 will transition to Level 3 after a set time)
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
let arrowWindow     = 1000; // ms to hit the arrow
let arrowTimerHandle = null;
let arrowTimerAnimHandle = null;
let l2Active        = false;
let l2StartTime     = null;
let l2FeverMode     = false;
let doubleArrow     = null;  // second arrow in a sequence
let doubleArrowHit  = false; // whether first was hit

// ══════════════════════════════════
//   LEVEL 3 — FLAPPY MIKU
// ══════════════════════════════════

let l3Active      = false;
let l3StartTime   = null;
let flappyRunning = false;
let flappyPaused  = false;
let flappyRaf     = null;
let leeksDodged   = 0;
const GRAVITY     = 0.45;
const FLAP_FORCE  = -8.5;
const LEEK_SPEED  = 3.2;
const LEEK_GAP    = 238;
const LEEK_INTERVAL = 1700; // ms between leeks
let lastLeekTime  = 0;

// Miku fairy image
const mikuFairyImg = new Image();
mikuFairyImg.src = 'miku_fairy.png';

let fairy = { x:0, y:0, vy:0, w:70, h:70, alive:true };
let leeks = [];
let rings = [];
let lastRingTime = 0;
const RING_INTERVAL = 5000;

function initFlappy() {
  fairy.x  = flappyCanvas.width * 0.22;
  fairy.y  = flappyCanvas.height * 0.45;
  fairy.vy = 0;
  fairy.alive = true;
  leeks = [];
  leeksDodged = 0;
  lastLeekTime = 0;
  score3El.textContent = '0';
  flappyGameover.classList.add('hidden');
  flappyInst.classList.remove('hidden');
  flappyRunning = false;
  flappyPaused  = false;
}

function resizeFlappy() {
  flappyCanvas.width  = window.innerWidth;
  flappyCanvas.height = window.innerHeight;
  if (!flappyRunning) initFlappy();
}

function startFlappy() {
  if (flappyRunning) return;
  flappyRunning = true;
  flappyInst.classList.add('hidden');
  lastLeekTime = performance.now();
  flappyLoop(performance.now());
}

function flapMiku() {
  if (!l3Active) return;
  if (!flappyRunning) { startFlappy(); }
  if (flappyPaused || !fairy.alive) return;
  fairy.vy = FLAP_FORCE;
}

function spawnLeek(now) {
  const h   = flappyCanvas.height;
  const minY = 80;
  const maxY = h - LEEK_GAP - 80;
  const gapY = minY + Math.random() * (maxY - minY);
  leeks.push({ x: flappyCanvas.width + 40, gapY, scored: false });
}

function flappyLoop(now) {
  if (!l3Active || flappyPaused) return;
  flappyRaf = requestAnimationFrame(flappyLoop);

  const W = flappyCanvas.width;
  const H = flappyCanvas.height;

  // Spawn bonus rings every 5 seconds
  if (now - lastRingTime > RING_INTERVAL) {
    const h = flappyCanvas.height;
    rings.push({
      x: flappyCanvas.width + 40,
      y: 80 + Math.random() * (h - 180),
      r: 36,
      collected: false,
      pulse: 0
    });
    lastRingTime = now;
  }

  // Move rings
  for (const rg of rings) { rg.x -= LEEK_SPEED * 0.8; rg.pulse += 0.15; }
  rings = rings.filter(rg => rg.x > -80 && !rg.collected);

  // Ring collision
  for (const rg of rings) {
    const dx = (fairy.x + fairy.w/2) - rg.x;
    const dy = (fairy.y + fairy.h/2) - rg.y;
    if (Math.sqrt(dx*dx + dy*dy) < rg.r + 20) {
      rg.collected = true;
      leeksDodged += 4;
      score3El.textContent = leeksDodged;
      score3TotalEl.textContent = (score + score2 + leeksDodged * 50).toLocaleString();
      for (let i = 0; i < 12; i++) spawnParticleAt(rg.x, rg.y, true);
      playPopSound();
    }
  }

  // Spawn leeks on interval
  if (now - lastLeekTime > LEEK_INTERVAL) {
    spawnLeek(now);
    lastLeekTime = now;
  }

  // Physics
  fairy.vy += GRAVITY;
  fairy.y  += fairy.vy;

  // Move leeks
  for (const lk of leeks) lk.x -= LEEK_SPEED;
  leeks = leeks.filter(lk => lk.x > -80);

  // Score leeks passed
  for (const lk of leeks) {
    if (!lk.scored && lk.x + 40 < fairy.x) {
      lk.scored = true;
      leeksDodged++;
      score3El.textContent = leeksDodged;
      score3TotalEl.textContent = (score + score2 + leeksDodged * 50).toLocaleString();
      for (let i = 0; i < 5; i++) spawnParticleAt(fairy.x + 40, fairy.y, true);
    }
  }

  // Collision: ceiling / floor
  if (fairy.y < 0 || fairy.y + fairy.h > H - 42) {
    killFairy(); return;
  }

  // Collision: leeks
  const fw = fairy.w * 0.65, fh = fairy.h * 0.65;
  const fx = fairy.x + fairy.w * 0.175, fy = fairy.y + fairy.h * 0.175;
  const leekW = 52;
  for (const lk of leeks) {
    const inX = fx < lk.x + leekW && fx + fw > lk.x;
    if (inX) {
      const hitTop    = fy < lk.gapY;
      const hitBottom = fy + fh > lk.gapY + LEEK_GAP;
      if (hitTop || hitBottom) { killFairy(); return; }
    }
  }

  drawFlappy();
}

function killFairy() {
  fairy.alive = false;
  flappyRunning = false;
  cancelAnimationFrame(flappyRaf);
  drawFlappy();
  flappyFinalLeeks.textContent = leeksDodged;
  setTimeout(() => flappyGameover.classList.remove('hidden'), 600);
}

function drawFlappy() {
  const W = flappyCanvas.width;
  const H = flappyCanvas.height;
  flappyCtx.clearRect(0, 0, W, H);

  // Soft pastel scrolling background layers
  // Sky gradient bands
  const skyColors = ['#fce4f0','#ede0ff','#ddf4ff'];
  const bandH = H / skyColors.length;
  skyColors.forEach((c, i) => {
    flappyCtx.fillStyle = c;
    flappyCtx.globalAlpha = 0.35;
    flappyCtx.fillRect(0, i * bandH, W, bandH);
  });
  flappyCtx.globalAlpha = 1;

  // Draw bonus rings
  for (const rg of rings) {
    flappyCtx.save();
    const pulse = Math.sin(rg.pulse) * 4;
    flappyCtx.strokeStyle = '#FFD700';
    flappyCtx.lineWidth = 5 + pulse * 0.3;
    flappyCtx.shadowColor = '#FFD700';
    flappyCtx.shadowBlur = 18 + pulse * 2;
    flappyCtx.beginPath();
    flappyCtx.arc(rg.x, rg.y, rg.r + pulse, 0, Math.PI * 2);
    flappyCtx.stroke();
    flappyCtx.strokeStyle = 'rgba(255,220,0,0.3)';
    flappyCtx.lineWidth = 12;
    flappyCtx.beginPath();
    flappyCtx.arc(rg.x, rg.y, rg.r + pulse, 0, Math.PI * 2);
    flappyCtx.stroke();
    flappyCtx.fillStyle = '#FFD700';
    flappyCtx.font = '22px serif';
    flappyCtx.textAlign = 'center';
    flappyCtx.textBaseline = 'middle';
    flappyCtx.fillText('⭐', rg.x, rg.y);
    flappyCtx.restore();
  }

  // Draw leeks
  for (const lk of leeks) drawLeek(lk.x, lk.gapY);

  // Draw fairy Miku
  if (mikuFairyImg.complete) {
    flappyCtx.save();
    if (!fairy.alive) { flappyCtx.globalAlpha = 0.5; flappyCtx.rotate(0.4); }
    // Tilt based on velocity
    flappyCtx.save();
    flappyCtx.translate(fairy.x + fairy.w/2, fairy.y + fairy.h/2);
    const tilt = Math.max(-0.4, Math.min(0.5, fairy.vy * 0.045));
    flappyCtx.rotate(tilt);
    flappyCtx.drawImage(mikuFairyImg, -fairy.w/2, -fairy.h/2, fairy.w, fairy.h);
    flappyCtx.restore();
    if (!fairy.alive) flappyCtx.restore();
  } else {
    // Fallback circle if image not loaded
    flappyCtx.fillStyle = '#FF69B4';
    flappyCtx.beginPath();
    flappyCtx.arc(fairy.x + fairy.w/2, fairy.y + fairy.h/2, 28, 0, Math.PI*2);
    flappyCtx.fill();
  }

  // Floor line
  flappyCtx.strokeStyle = 'rgba(180,100,255,0.2)';
  flappyCtx.lineWidth = 2;
  flappyCtx.beginPath();
  flappyCtx.moveTo(0, H - 42); flappyCtx.lineTo(W, H - 42);
  flappyCtx.stroke();
}

function drawLeek(x, gapY) {
  const W = flappyCanvas.width;
  const H = flappyCanvas.height;
  const lw = 52; // leek width

  flappyCtx.save();

  // ── TOP LEEK (upside down, roots at top, leaves pointing down into gap) ──
  // Stem
  flappyCtx.fillStyle = '#e8e0c0';
  flappyCtx.strokeStyle = '#c8b88a';
  flappyCtx.lineWidth = 1.5;
  roundRect(flappyCtx, x + 10, 0, 32, gapY - 30, 4);
  flappyCtx.fill(); flappyCtx.stroke();
  // Bulb at bottom of top leek
  flappyCtx.fillStyle = '#f5f0e8';
  flappyCtx.beginPath();
  flappyCtx.ellipse(x + lw/2, gapY - 18, 18, 20, 0, 0, Math.PI*2);
  flappyCtx.fill(); flappyCtx.stroke();
  // Green leaves fanning down into gap
  flappyCtx.strokeStyle = '#5a9a3a'; flappyCtx.lineWidth = 7; flappyCtx.lineCap = 'round';
  flappyCtx.beginPath(); flappyCtx.moveTo(x+lw/2-6, gapY-10); flappyCtx.quadraticCurveTo(x+lw/2-18, gapY+10, x+lw/2-14, gapY+28); flappyCtx.stroke();
  flappyCtx.strokeStyle = '#6ab04a'; flappyCtx.lineWidth = 6;
  flappyCtx.beginPath(); flappyCtx.moveTo(x+lw/2+4, gapY-10); flappyCtx.quadraticCurveTo(x+lw/2+16, gapY+8, x+lw/2+12, gapY+26); flappyCtx.stroke();
  flappyCtx.strokeStyle = '#7acc5a'; flappyCtx.lineWidth = 5;
  flappyCtx.beginPath(); flappyCtx.moveTo(x+lw/2, gapY-10); flappyCtx.quadraticCurveTo(x+lw/2, gapY+14, x+lw/2-4, gapY+30); flappyCtx.stroke();

  // ── BOTTOM LEEK (right way up, roots at bottom) ──
  const bottomTop = gapY + LEEK_GAP;
  // Green leaves at top
  flappyCtx.strokeStyle = '#5a9a3a'; flappyCtx.lineWidth = 7; flappyCtx.lineCap = 'round';
  flappyCtx.beginPath(); flappyCtx.moveTo(x+lw/2-6, bottomTop+10); flappyCtx.quadraticCurveTo(x+lw/2-20, bottomTop-20, x+lw/2-14, bottomTop-45); flappyCtx.stroke();
  flappyCtx.strokeStyle = '#6ab04a'; flappyCtx.lineWidth = 6;
  flappyCtx.beginPath(); flappyCtx.moveTo(x+lw/2+4, bottomTop+10); flappyCtx.quadraticCurveTo(x+lw/2+18, bottomTop-18, x+lw/2+12, bottomTop-42); flappyCtx.stroke();
  flappyCtx.strokeStyle = '#7acc5a'; flappyCtx.lineWidth = 5;
  flappyCtx.beginPath(); flappyCtx.moveTo(x+lw/2, bottomTop+10); flappyCtx.quadraticCurveTo(x+lw/2+2, bottomTop-22, x+lw/2-2, bottomTop-48); flappyCtx.stroke();
  // Stem
  flappyCtx.fillStyle = '#e8e0c0'; flappyCtx.strokeStyle = '#c8b88a'; flappyCtx.lineWidth = 1.5;
  roundRect(flappyCtx, x+10, bottomTop+18, 32, H-bottomTop-60, 4);
  flappyCtx.fill(); flappyCtx.stroke();
  // Bulb at top of bottom leek
  flappyCtx.fillStyle = '#f5f0e8';
  flappyCtx.beginPath();
  flappyCtx.ellipse(x+lw/2, bottomTop+20, 18, 20, 0, 0, Math.PI*2);
  flappyCtx.fill(); flappyCtx.stroke();

  flappyCtx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y); ctx.arcTo(x+w, y, x+w, y+r, r);
  ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
  ctx.lineTo(x+r, y+h); ctx.arcTo(x, y+h, x, y+h-r, r);
  ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r);
  ctx.closePath();
}



function playEatSound() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    // Quick rising chirp -- softer and shorter than the pop
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    const pitches = [659, 784, 880, 988, 1047, 1175];
    const pitch = pitches[Math.floor(Math.random() * pitches.length)];
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.3, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);

    // Tiny second ping for brightness
    const osc2  = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(pitch * 3, ctx.currentTime);
    gain2.gain.setValueAtTime(0.05, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.07);
  } catch(e) {}
}

// ══════════════════════════════════
//   LEVEL 4 — MIKU PAC-MAN RUNNER
// ══════════════════════════════════

let l4Active      = false;
let l4StartTime   = null;
let pacRunning    = false;
let pacPaused     = false;
let pacRaf        = null;
let notesEaten    = 0;
let score4        = 0;
const PAC_SPEED   = 3.8;
const NOTE_SPEED  = 4.5;
const LEEK4_SPEED = 6.0;

const mikuPacImg = new Image();
mikuPacImg.src = 'miku_pac.png';

let pac = { x:0, y:0, vy:0, w:110, h:110, targetY:0, targetX:0 };
let notes4  = [];
let leeks4  = [];
let lastNote4Time = 0;
let lastLeek4Time = 0;
const NOTE_INTERVAL4 = 650;
const LEEK_INTERVAL4 = 1300;
let leekWaveIndex4  = 0;
let magnets4        = [];
let magnetActive    = false;
let magnetEndTime   = 0;
let lastMagnet4Time = 0;
const MAGNET_INTERVAL = 8000;
const MAGNET_DURATION = 3000;
const PAC_STEP = 6; // pixels per key press

function initPac() {
  pac.x = 110;
  pac.y = pacCanvas.height * 0.5;
  pac.targetY = pac.y;
  pac.targetX = 110;
  notes4  = [];
  leeks4  = [];
  magnets4 = [];
  magnetActive = false;
  lastMagnet4Time = 0;
  leekWaveIndex4 = 0;
  notesEaten = 0;
  score4  = 0;
  score4El.textContent = '0';
  lastNote4Time = 0;
  lastLeek4Time = 0;
  pac4Gameover.classList.add('hidden');
  pac4Inst.classList.remove('hidden');
  pacRunning = false;
  pacPaused  = false;
}

function resizePac() {
  pacCanvas.width  = window.innerWidth;
  pacCanvas.height = window.innerHeight;
  if (!pacRunning) initPac();
}

function startPac() {
  if (pacRunning) return;
  pacRunning = true;
  pac4Inst.classList.add('hidden');
  lastNote4Time = performance.now();
  lastLeek4Time = performance.now();
  pacLoop(performance.now());
}

function movePacUp() {
  if (!l4Active || !pacRunning || pacPaused) return;
  pac.targetY = Math.max(60, pac.targetY - pacCanvas.height * 0.14);
}
function movePacDown() {
  if (!l4Active || !pacRunning || pacPaused) return;
  pac.targetY = Math.min(pacCanvas.height - 80, pac.targetY + pacCanvas.height * 0.14);
}
function movePacLeft() {
  if (!l4Active || !pacRunning || pacPaused) return;
  pac.targetX = Math.max(40, pac.targetX - pacCanvas.width * 0.1);
}
function movePacRight() {
  if (!l4Active || !pacRunning || pacPaused) return;
  pac.targetX = Math.min(pacCanvas.width * 0.5, pac.targetX + pacCanvas.width * 0.1);
}

function pacLoop(now) {
  if (!l4Active || pacPaused) return;
  pacRaf = requestAnimationFrame(pacLoop);

  const W = pacCanvas.width;
  const H = pacCanvas.height;

  // Smooth movement toward target (both axes)
  pac.y += (pac.targetY - pac.y) * 0.18;
  pac.x += (pac.targetX - pac.x) * 0.18;

  // Spawn magnet power-up
  if (now - lastMagnet4Time > MAGNET_INTERVAL) {
    const laneCount = 5;
    const laneH = (H - 120) / laneCount;
    const lane = Math.floor(Math.random() * laneCount);
    magnets4.push({ x: W + 30, y: 60 + lane * laneH + laneH * 0.5, r: 22, collected: false });
    lastMagnet4Time = now;
  }

  // Move magnets
  magnets4.forEach(m => m.x -= NOTE_SPEED);
  magnets4 = magnets4.filter(m => m.x > -40 && !m.collected);

  // Magnet collision
  for (const mg of magnets4) {
    if (Math.abs((pac.x + pac.w/2) - mg.x) < 40 && Math.abs((pac.y + pac.h/2) - mg.y) < 40) {
      mg.collected = true;
      magnetActive  = true;
      magnetEndTime = now + MAGNET_DURATION;
      playFanfare();
      for (let i = 0; i < 10; i++) spawnParticleAt(pac.x + pac.w/2, pac.y + pac.h/2, true);
    }
  }

  // Magnet effect -- auto-collect all notes on screen
  if (magnetActive && now < magnetEndTime) {
    for (const n of notes4) {
      if (!n.eaten) {
        n.eaten = true;
        notesEaten++;
        score4 += 50;
        playEatSound();
        spawnParticleAt(n.x, n.y, true);
      }
    }
    notes4 = notes4.filter(n => !n.eaten);
    score4El.textContent = score4.toLocaleString();
    score4TotalEl.textContent = (score + score2 + leeksDodged * 50 + score4).toLocaleString();
  } else if (magnetActive && now >= magnetEndTime) {
    magnetActive = false;
  }

  // Spawn notes
  if (now - lastNote4Time > NOTE_INTERVAL4) {
    const laneCount = 5;
    const laneH = (H - 120) / laneCount;
    const lane = Math.floor(Math.random() * laneCount);
    notes4.push({
      x: W + 30,
      y: 60 + lane * laneH + laneH * 0.5,
      r: 28,
      symbol: ['♪','♫','♩','♬'][Math.floor(Math.random()*4)],
      color: ['#39C5BB','#00FFFF','#FF69B4','#ffffff','#aaddff'][Math.floor(Math.random()*5)],
      eaten: false
    });
    lastNote4Time = now;
  }

  // Spawn leeks in wave patterns
  if (now - lastLeek4Time > LEEK_INTERVAL4) {
    const laneCount = 4;
    const laneH = (H - 120) / laneCount;
    const wave = leekWaveIndex4 % 5;
    if (wave === 0) {
      // Single random leek
      const lane = Math.floor(Math.random() * laneCount);
      leeks4.push({ x: W+30, y: 60+lane*laneH+laneH*0.3, w:44, h:80 });
    } else if (wave === 1) {
      // Top + bottom pair (corridor in middle)
      leeks4.push({ x: W+30, y: 60+0*laneH+laneH*0.3, w:44, h:80 });
      leeks4.push({ x: W+30, y: 60+3*laneH+laneH*0.3, w:44, h:80 });
    } else if (wave === 2) {
      // Staggered pair (offset x)
      const lane = Math.floor(Math.random() * 2);
      leeks4.push({ x: W+30,  y: 60+lane*laneH+laneH*0.3, w:44, h:80 });
      leeks4.push({ x: W+130, y: 60+(lane+2)*laneH+laneH*0.3, w:44, h:80 });
    } else if (wave === 3) {
      // Three leeks -- avoid one lane (safe lane)
      const safeLane = Math.floor(Math.random() * laneCount);
      for (let ln = 0; ln < laneCount; ln++) {
        if (ln !== safeLane) leeks4.push({ x: W+30, y: 60+ln*laneH+laneH*0.3, w:44, h:80 });
      }
    } else {
      // Single fast leek (slightly faster)
      const lane = Math.floor(Math.random() * laneCount);
      leeks4.push({ x: W+30, y: 60+lane*laneH+laneH*0.3, w:44, h:80, fast:true });
    }
    leekWaveIndex4++;
    lastLeek4Time = now;
  }

  // Move notes & leeks
  notes4.forEach(n => n.x -= NOTE_SPEED);
  leeks4.forEach(l => l.x -= l.fast ? LEEK4_SPEED * 1.7 : LEEK4_SPEED);
  notes4 = notes4.filter(n => n.x > -40);
  leeks4 = leeks4.filter(l => l.x > -60);

  // Collisions: notes
  const px = pac.x + pac.w * 0.2, py = pac.y + pac.h * 0.2;
  const pw = pac.w * 0.6, ph = pac.h * 0.6;
  for (const n of notes4) {
    if (!n.eaten && Math.abs((px + pw/2) - n.x) < n.r + pw/2 && Math.abs((py + ph/2) - n.y) < n.r + ph/2) {
      n.eaten = true;
      notesEaten++;
      score4 += 50;
      playEatSound();
      score4El.textContent = score4.toLocaleString();
      score4TotalEl.textContent = (score + score2 + leeksDodged * 50 + score4).toLocaleString();
      for (let i = 0; i < 5; i++) spawnParticleAt(pac.x + pac.w, pac.y + pac.h/2, true);
    }
  }
  notes4 = notes4.filter(n => !n.eaten);

  // Collisions: leeks (lose 100 points, flash red)
  for (const lk of leeks4) {
    if (lk.hit) continue;
    if (px < lk.x + lk.w && px + pw > lk.x && py < lk.y + lk.h && py + ph > lk.y) {
      lk.hit = true;
      score4 -= 100;
      if (score4 < 0) score4 = 0;
      score4El.textContent = score4.toLocaleString();
      score4TotalEl.textContent = (score + score2 + leeksDodged * 50 + score4).toLocaleString();
      const flash = document.createElement('div');
      flash.className = 'penalty-flash';
      document.body.appendChild(flash);
      flash.addEventListener('animationend', () => flash.remove());
    }
  }
  leeks4 = leeks4.filter(l => !l.hit);

  drawPac();
}

function drawPac() {
  const W = pacCanvas.width;
  const H = pacCanvas.height;
  pacCtx.clearRect(0, 0, W, H);

  // Subtle lane guides
  pacCtx.strokeStyle = 'rgba(57,197,187,0.06)';
  pacCtx.lineWidth = 1;
  const laneCount = 5;
  const laneH = (H - 120) / laneCount;
  for (let i = 1; i < laneCount; i++) {
    pacCtx.beginPath();
    pacCtx.setLineDash([8, 12]);
    pacCtx.moveTo(0, 60 + i * laneH);
    pacCtx.lineTo(W, 60 + i * laneH);
    pacCtx.stroke();
  }
  pacCtx.setLineDash([]);

  // Draw notes
  for (const n of notes4) {
    pacCtx.save();
    pacCtx.font = `bold ${n.r * 2}px serif`;
    pacCtx.fillStyle = n.color;
    pacCtx.shadowColor = n.color;
    pacCtx.shadowBlur = 12;
    pacCtx.textAlign = 'center';
    pacCtx.textBaseline = 'middle';
    pacCtx.fillText(n.symbol, n.x, n.y);
    pacCtx.restore();
  }

  // Draw magnet power-ups
  for (const mg of magnets4) {
    pacCtx.save();
    const pulse = Math.sin(now * 0.006) * 3;
    pacCtx.strokeStyle = '#00BFFF';
    pacCtx.lineWidth = 4;
    pacCtx.shadowColor = '#00BFFF';
    pacCtx.shadowBlur = 18 + pulse;
    pacCtx.beginPath();
    pacCtx.arc(mg.x, mg.y, mg.r + pulse * 0.4, 0, Math.PI * 2);
    pacCtx.stroke();
    pacCtx.font = '26px serif';
    pacCtx.fillStyle = '#00BFFF';
    pacCtx.textAlign = 'center';
    pacCtx.textBaseline = 'middle';
    pacCtx.fillText('🧲', mg.x, mg.y);
    pacCtx.restore();
  }

  // Magnet active indicator
  if (magnetActive) {
    const remaining = ((magnetEndTime - now) / MAGNET_DURATION);
    pacCtx.save();
    pacCtx.strokeStyle = 'rgba(0,191,255,0.6)';
    pacCtx.lineWidth = 6;
    pacCtx.beginPath();
    pacCtx.arc(pac.x + pac.w/2, pac.y + pac.h/2, pac.w * 0.8, 0, Math.PI * 2 * remaining);
    pacCtx.stroke();
    pacCtx.font = 'bold 14px sans-serif';
    pacCtx.fillStyle = '#00BFFF';
    pacCtx.textAlign = 'center';
    pacCtx.fillText('MAGNET!', pac.x + pac.w/2, pac.y - 12);
    pacCtx.restore();
  }

  // Draw leeks (simple SVG-style)
  for (const lk of leeks4) {
    pacCtx.save();
    // stem
    pacCtx.fillStyle = '#e8e0c0';
    pacCtx.strokeStyle = '#c8b88a';
    pacCtx.lineWidth = 1.5;
    pacCtx.beginPath();
    pacCtx.roundRect(lk.x + 8, lk.y + 30, 28, lk.h - 30, 4);
    pacCtx.fill(); pacCtx.stroke();
    // bulb
    pacCtx.fillStyle = '#f5f0e8';
    pacCtx.beginPath();
    pacCtx.ellipse(lk.x + 22, lk.y + 32, 16, 18, 0, 0, Math.PI*2);
    pacCtx.fill(); pacCtx.stroke();
    // leaves
    pacCtx.strokeStyle = '#5a9a3a'; pacCtx.lineWidth = 6; pacCtx.lineCap = 'round';
    pacCtx.beginPath(); pacCtx.moveTo(lk.x+16, lk.y+16); pacCtx.quadraticCurveTo(lk.x+4, lk.y-10, lk.x+8, lk.y-28); pacCtx.stroke();
    pacCtx.strokeStyle = '#6ab04a'; pacCtx.lineWidth = 5;
    pacCtx.beginPath(); pacCtx.moveTo(lk.x+26, lk.y+16); pacCtx.quadraticCurveTo(lk.x+38, lk.y-8, lk.x+34, lk.y-26); pacCtx.stroke();
    pacCtx.restore();
  }

  // Draw Miku pac
  if (mikuPacImg.complete && mikuPacImg.naturalWidth > 0) {
    pacCtx.save();
    // Slight bob animation
    const bob = Math.sin(performance.now() * 0.006) * 3;
    pacCtx.drawImage(mikuPacImg, pac.x, pac.y + bob, pac.w, pac.h);
    pacCtx.restore();
  } else {
    pacCtx.fillStyle = '#39C5BB';
    pacCtx.beginPath();
    pacCtx.arc(pac.x + pac.w/2, pac.y + pac.h/2, 30, 0, Math.PI*2);
    pacCtx.fill();
  }

  // Floor & ceiling lines
  pacCtx.strokeStyle = 'rgba(57,197,187,0.15)';
  pacCtx.lineWidth = 2;
  pacCtx.beginPath(); pacCtx.moveTo(0, 58); pacCtx.lineTo(W, 58); pacCtx.stroke();
  pacCtx.beginPath(); pacCtx.moveTo(0, H - 42); pacCtx.lineTo(W, H - 42); pacCtx.stroke();
}

function goToLevel4() {
  if (currentLevel === 4) return;
  // Stop level 3 immediately so no collisions happen during transition
  l3Active = false;
  flappyPaused = true;
  cancelAnimationFrame(flappyRaf);
  transitionText.textContent = '🎵 Level 4 🎵';
  transitionSub.textContent  = 'Eat the notes! Dodge the leeks!';
  levelTransition.classList.remove('hidden');
  playFanfare();
  setTimeout(() => {
    levelTransition.classList.add('hidden');
    level3Screen.classList.add('hidden');
    level4Screen.classList.remove('hidden');
    document.body.classList.remove('level3');
    document.body.classList.add('level4');
    currentLevel = 4;
    l4Active = true;
    l3Active = false;
    l4StartTime = performance.now();
    // Show running total going into level 4
    const l4RunningTotal = score + score2 + leeksDodged * 50;
    score4El.textContent = '0';
    score4TotalEl.textContent = l4RunningTotal.toLocaleString();
    cancelAnimationFrame(flappyRaf);
    resizePac();
    drawPac();
  }, 2800);
}

window.addEventListener('resize', () => { if (currentLevel === 4) resizePac(); });


function goToLevel3() {
  // Stop level 2 immediately so no points can be lost during transition
  l2Active = false;
  currentArrow = null;
  clearTimeout(arrowTimerHandle);
  arrowTarget.textContent = '';
  arrowTimerBar.style.transition = 'none';
  arrowTimerBar.style.transform = 'scaleX(0)';
  transitionText.textContent = '🧅 Level 3 🧅';
  transitionSub.textContent  = 'Flappy Miku! Dodge the leeks!';
  levelTransition.classList.remove('hidden');
  playFanfare();
  setTimeout(() => {
    levelTransition.classList.add('hidden');
    level2Screen.classList.add('hidden');
    level3Screen.classList.remove('hidden');
    document.body.classList.remove('level2');
    document.body.classList.add('level3');
    currentLevel = 3;
    l3Active = true;
    l2Active = false;
    l3StartTime = performance.now();
    // Show running total going into level 3
    const l3RunningTotal = score + score2;
    score3El.textContent = '0';
    score3TotalEl.textContent = l3RunningTotal.toLocaleString();
    resizeFlappy();
    drawFlappy();
  }, 2800);
}

window.addEventListener('resize', () => { if (currentLevel === 3) resizeFlappy(); });
const PERFECT_MS    = 100;
const GOOD_MS       = 280;

function goToLevel2() {
  // Show transition screen
  transitionText.textContent = '⚡ Level 2 ⚡';
  transitionSub.textContent  = 'Shadow Boxing! Hit the arrows!';
  levelTransition.classList.remove('hidden');
  playFanfare();

  setTimeout(() => {
    levelTransition.classList.add('hidden');
    level1Screen.classList.add('hidden');
    level2Screen.classList.remove('hidden');
    document.body.classList.remove('level1');
    document.body.classList.add('level2');
    currentLevel = 2;
    l2Active = true;
    l2StartTime = performance.now();
    arrowHint.textContent = 'Hit the arrow key!';
    // Show running total going into level 2
    score2El.textContent = score.toLocaleString();
    score2El.classList.toggle('negative', score < 0);
    // Trigger first arrow shortly
    setTimeout(showNextArrow, 800);
  }, 2800);
}

function showNextArrow() {
  if (!l2Active || !player.isPlaying) return;
  currentArrow    = ARROWS[Math.floor(Math.random() * ARROWS.length)];
  doubleArrow     = null;
  doubleArrowHit  = false;
  arrowShownAt    = performance.now();

  // 25% chance of a combo sequence (two arrows)
  // Only in fever mode or when combo >= 4
  if ((l2FeverMode || combo2 >= 4) && Math.random() < 0.35) {
    // Pick a different second arrow
    const others = ARROWS.filter(a => a !== currentArrow);
    doubleArrow = others[Math.floor(Math.random() * others.length)];
    arrowTarget.innerHTML = `<span class="arrow-main">${currentArrow}</span><span class="arrow-combo"> + ${doubleArrow}</span>`;
  } else {
    arrowTarget.textContent = currentArrow;
  }
  arrowTarget.className = '';

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

  // Handle double arrow combo -- first hit
  if (doubleArrow && !doubleArrowHit) {
    if (key !== expected) { registerMiss(); return; }
    doubleArrowHit = true;
    // Visually update to show second arrow needed
    arrowTarget.innerHTML = `<span class="arrow-done">${currentArrow} ✓</span><span class="arrow-main"> ${doubleArrow}</span>`;
    highlightKey(key);
    // Update currentArrow to second arrow
    currentArrow = doubleArrow;
    arrowShownAt = performance.now(); // reset timer for second hit
    return;
  }

  if (key !== expected) {
    registerMiss(); return;
  }
  const elapsed = performance.now() - arrowShownAt;
  clearTimeout(arrowTimerHandle);
  const wasDouble = doubleArrow !== null;
  doubleArrow = null;
  doubleArrowHit = false;
  currentArrow = null;

  // Flash key indicator
  highlightKey(key);

  if (elapsed <= PERFECT_MS) {
    const bonusMult = wasDouble ? 2.5 : 1;
    showRating(wasDouble ? '🔥 COMBO! ✦✦' : 'PERFECT ✦', 'perfect');
    addScore2(Math.round(150 * Math.min(combo2 + 1, 8) * bonusMult));
    combo2++;
    arrowTarget.classList.add('hit-perfect');
    l2Miku.classList.add('hit-perfect');
    setTimeout(() => { arrowTarget.classList.remove('hit-perfect'); l2Miku.classList.remove('hit-perfect'); }, 300);
    for (let i = 0; i < 8; i++) spawnParticleAt(Math.random()*window.innerWidth, Math.random()*window.innerHeight, true);
  } else {
    const bonusMult = wasDouble ? 2 : 1;
    showRating(wasDouble ? '🔥 COMBO! ✓✓' : 'GOOD ✓', 'good');
    addScore2(Math.round(75 * Math.min(combo2 + 1, 8) * bonusMult));
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
    combo2Wrap.className = (combo2 >= 8 ? 'hot' : combo2 >= 5 ? 'warm' : '');
    combo2El.textContent = combo2;
  } else {
    combo2Wrap.classList.add('hidden');
  }
  // Fever mode kicks in at 8x combo
  const shouldFever = combo2 >= 8;
  if (shouldFever !== l2FeverMode) {
    l2FeverMode = shouldFever;
    document.body.classList.toggle('fever-mode', l2FeverMode);
    if (l2FeverMode) {
      arrowHint.textContent = '🔥 FEVER MODE! 🔥';
      playFanfare();
    } else {
      arrowHint.textContent = 'Hit the arrow key!';
    }
  }
}

// Keyboard handler
document.addEventListener('keydown', (e) => {
  if (currentLevel === 2 && ARROW_KEYS[e.key]) {
    e.preventDefault();
    registerHit(e.key);
  }
  if (currentLevel === 3 && e.key === ' ') {
    e.preventDefault();
    flapMiku();
  }
  if (currentLevel === 4) {
    if (e.key === 'ArrowUp')    { e.preventDefault(); movePacUp();    if (!pacRunning) startPac(); }
    if (e.key === 'ArrowDown')  { e.preventDefault(); movePacDown();  if (!pacRunning) startPac(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); movePacLeft();  if (!pacRunning) startPac(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); movePacRight(); if (!pacRunning) startPac(); }
  }
});


// ══════════════════════════════════
//   POP SOUND (Web Audio API)
// ══════════════════════════════════

let audioCtx = null;


function getStarRating(levelScore, thresholds) {
  if (levelScore >= thresholds[2]) return 3;
  if (levelScore >= thresholds[1]) return 2;
  if (levelScore >= thresholds[0]) return 1;
  return 0;
}

function renderStars(count) {
  return '⭐'.repeat(count) + '☆'.repeat(3 - count);
}


function launchConfetti() {
  const colors = ['#39C5BB','#FF69B4','#00FFFF','#FFD700','#FF6B6B','#88FF44','#ffffff'];
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.cssText = `
        left:${Math.random() * 100}vw;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        width:${6 + Math.random() * 8}px;
        height:${8 + Math.random() * 10}px;
        animation-duration:${1.5 + Math.random() * 2}s;
        animation-delay:${Math.random() * 0.5}s;
        transform:rotate(${Math.random() * 360}deg);
      `;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, i * 25);
  }
}

function buildStarSummary() {
  const l1Stars = getStarRating(score,             [200, 500, 800]);
  const l2Stars = getStarRating(score2,            [300, 700, 1200]);
  const l3Stars = getStarRating(leeksDodged * 50,  [150, 400, 700]);
  const l4Stars = getStarRating(score4,            [200, 500, 900]);
  return `
    <div class="star-row"><span class="star-level">Level 1 Quiz</span><span class="star-val">${renderStars(l1Stars)}</span></div>
    <div class="star-row"><span class="star-level">Level 2 Boxing</span><span class="star-val">${renderStars(l2Stars)}</span></div>
    <div class="star-row"><span class="star-level">Level 3 Flappy</span><span class="star-val">${renderStars(l3Stars)}</span></div>
    <div class="star-row"><span class="star-level">Level 4 Runner</span><span class="star-val">${renderStars(l4Stars)}</span></div>
  `;
}

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}


function playFanfare() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch(e) {}
}

function playPopSound() {
  try {
    const ctx  = getAudioCtx();
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();

    const pitches = [523, 587, 659, 784, 880, 1047];
    const pitch   = pitches[Math.floor(Math.random() * pitches.length)];

    // Main tone
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 2, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);

    // Bright overtone for sparkle
    const osc2  = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(pitch * 2, ctx.currentTime);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.15);
  } catch(e) {
    // Silently fail if audio not available
  }
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
  playPopSound();
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
      } else if (currentLevel === 3) {
        seekFill3.style.width = pct;
        timeDisplay3.textContent = formatTime(position) + ' / ' + formatTime(len);
      } else if (currentLevel === 4) {
        seekFill4.style.width = pct;
        timeDisplay4.textContent = formatTime(position) + ' / ' + formatTime(len);
      }
    }
    if (Math.random() < 0.08) spawnParticle(false);

    // Level 2 runs for 30 seconds then transitions to Level 3
    if (currentLevel === 2 && l2StartTime && (performance.now() - l2StartTime) >= 30000) {
      l2StartTime = null;
      goToLevel3();
    }
    // Level 3 runs for 30 seconds then transitions to Level 4
    if (currentLevel === 3 && l3StartTime && (performance.now() - l3StartTime) >= 30000) {
      l3StartTime = null;
      goToLevel4();
    }
    // Level 4 runs for 30 seconds then goes to end screen
    if (currentLevel === 4 && l4StartTime && (performance.now() - l4StartTime) >= 30000) {
      l4StartTime = null;
      goToEndScreen();
    }
    const beat = player.findBeat(position);
    if (beat && Math.abs(position - beat.startTime) < 30) {
      beatFlash.className = '';
      void beatFlash.offsetWidth;
      beatFlash.className = currentLevel === 4 ? 'flash-l4' : currentLevel === 3 ? 'flash-l3' : currentLevel === 2 ? 'flash-l2' : 'flash-l1';
      if (currentLevel === 1) {
        l1Miku.classList.add('beat');
        setTimeout(() => l1Miku.classList.remove('beat'), 200);
      }
      if (currentLevel === 2) {
        // Vibrant beat: flash background, pulse arrow, spawn particles
        document.body.classList.add('beat-pulse');
        setTimeout(() => document.body.classList.remove('beat-pulse'), 180);
        // arrow beat flash removed -- caused confusion
        for (let i = 0; i < 4; i++) spawnParticleAt(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight, true
        );
      }
      if (currentLevel === 3) {
        // Vibrant beat: flash background, make fairy pulse, spawn particles
        document.body.classList.add('beat-pulse');
        setTimeout(() => document.body.classList.remove('beat-pulse'), 180);
        if (fairy.alive) {
          flappyCtx && drawFlappy();
        }
        for (let i = 0; i < 5; i++) spawnParticleAt(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight, true
        );
      }
    }
  },

  onPlay() {
    if (currentLevel === 1) btnPlayPause.textContent = '⏸ PAUSE';
    if (currentLevel === 2) btn2PlayPause.textContent = '⏸ PAUSE';
    if (currentLevel === 3) btn3PlayPause.textContent = '⏸ PAUSE';
    if (currentLevel === 4) btn4PlayPause.textContent = '⏸ PAUSE';
  },
  onPause() {
    if (currentLevel === 1) btnPlayPause.textContent = '▶ PLAY';
    if (currentLevel === 2) { btn2PlayPause.textContent = '▶ PLAY'; l2Active = false; }
    if (currentLevel === 3) { btn3PlayPause.textContent = '▶ PLAY'; flappyPaused = true; cancelAnimationFrame(flappyRaf); }
    if (currentLevel === 4) { btn4PlayPause.textContent = '▶ PLAY'; pacPaused = true; cancelAnimationFrame(pacRaf); }
  },
  onStop() {
    if (currentLevel === 1) btnPlayPause.textContent = '▶ PLAY';
    if (currentLevel === 2) { btn2PlayPause.textContent = '▶ PLAY'; l2Active = false; currentArrow = null; l2FeverMode = false; document.body.classList.remove('fever-mode'); }
    if (currentLevel === 3) { btn3PlayPause.textContent = '▶ PLAY'; l3Active = false; flappyPaused = true; cancelAnimationFrame(flappyRaf); }
    if (currentLevel === 4) { btn4PlayPause.textContent = '▶ PLAY'; l4Active = false; pacPaused = true; cancelAnimationFrame(pacRaf); }
    seekFill.style.width = '0%'; seekFill2.style.width = '0%'; seekFill3.style.width = '0%'; if (seekFill4) seekFill4.style.width = '0%';
    const totalScore = score + score2 + leeksDodged * 50 + score4;
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
btn3PlayPause.addEventListener('click', () => {
  if (player.isPlaying) { player.requestPause(); flappyPaused = true; cancelAnimationFrame(flappyRaf); }
  else { player.requestPlay(); flappyPaused = false; if (flappyRunning && fairy.alive) flappyLoop(performance.now()); }
});
btn3Stop.addEventListener('click', () => player.requestStop());
btnFlappyRetry.addEventListener('click', () => { initFlappy(); drawFlappy(); });
if (btn4PlayPause) btn4PlayPause.addEventListener('click', () => {
  if (player.isPlaying) { player.requestPause(); pacPaused = true; cancelAnimationFrame(pacRaf); }
  else { player.requestPlay(); pacPaused = false; if (pacRunning && l4Active) pacLoop(performance.now()); }
});
if (btn4Stop) btn4Stop.addEventListener('click', () => player.requestStop());
if (btnPacRetry) btnPacRetry.addEventListener('click', () => { initPac(); drawPac(); });
if (pacCanvas) pacCanvas.addEventListener('click', () => { if (!pacRunning) startPac(); });
flappyCanvas.addEventListener('click', () => flapMiku());

function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.floor(ms/1000);
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}


// ══════════════════════════════════
//   END SCREEN
// ══════════════════════════════════

function goToEndScreen() {
  if (currentLevel === 'end') return;
  currentLevel = 'end';
  l4Active = false;
  pacPaused = true;
  cancelAnimationFrame(pacRaf);

  // Calculate final total score -- capture all values NOW before timeout
  const finalTotal = score + score2 + leeksDodged * 50 + score4;

  // Transition screen
  playFanfare();
  transitionText.textContent = '🎉 You did it! 🎉';
  transitionSub.textContent  = `Final Score: ${finalTotal.toLocaleString()}`;
  levelTransition.classList.remove('hidden');

  setTimeout(() => {
    levelTransition.classList.add('hidden');
    level4Screen.classList.add('hidden');
    document.body.classList.remove('level4');

    // Show end screen
    document.body.classList.add('end');
    endScreen.classList.remove('hidden');

    // Miku reacts to score
    const endMiku = document.getElementById('end-miku');
    if (finalTotal >= 1500) {
      endMiku.src = 'miku_image.png'; // happy
      endCongrats.textContent = '🌟 AMAZING! You crushed it! 🌟';
    } else if (finalTotal >= 800) {
      endMiku.src = 'miku_image.png';
      endCongrats.textContent = '🎵 Great job! So close to perfect!';
    } else if (finalTotal >= 400) {
      endMiku.src = 'miku_alien.png'; // surprised
      endCongrats.textContent = '💙 Not bad! Try again to beat your score!';
    } else {
      endMiku.src = 'miku_alien.png'; // shocked
      endCongrats.textContent = '🧅 Watch out for those leeks next time!';
    }

    // Show final score immediately with captured value
    endScoreEl.textContent = finalTotal.toLocaleString();
    endScoreEl.classList.toggle('negative', finalTotal < 0);
    // Save high score
    if (finalTotal > highScore) {
      highScore = finalTotal;
      localStorage.setItem('mikuHighScore', highScore);
      endHighScoreEl.textContent = '🌟 NEW HIGH SCORE! 🌟';
      endHighScoreEl.style.color = '#FFD700';
      endStarsEl.innerHTML = buildStarSummary();
    } else {
      endHighScoreEl.textContent = 'Best: ' + highScore.toLocaleString();
      endHighScoreEl.style.color = 'rgba(57,197,187,0.7)';
      endStarsEl.innerHTML = buildStarSummary();
    }

    // Start falling notes
    endScreenActive = true;
    launchConfetti();
    endSpawnInterval = setInterval(spawnEndNote, 700);
    setTimeout(spawnEndNote, 100);
    setTimeout(spawnEndNote, 350);
  }, 3000);
}

function loop() { updateParticles(); requestAnimationFrame(loop); }
loop();

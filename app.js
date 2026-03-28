// ============================================
//   Green Lights Serenade / Hatsune Miku
//   Lyric App — powered by TextAlive App API
// ============================================

// ── DOM refs ──
const introScreen    = document.getElementById('intro-screen');
const notesField     = document.getElementById('notes-field');
const noteCountEl    = document.getElementById('note-count');
const noteProgress   = document.getElementById('note-progress-fill');
const introMiku      = document.getElementById('intro-miku');
const winOverlay     = document.getElementById('win-overlay');
const quizScreen     = document.getElementById('quiz-screen');
const quizMiku       = document.getElementById('quiz-miku');
const quizQNum       = document.getElementById('quiz-q-num');
const quizProgressFill = document.getElementById('quiz-progress-fill');
const quizQuestion   = document.getElementById('quiz-question');
const quizAnswers    = document.getElementById('quiz-answers');
const quizFeedback   = document.getElementById('quiz-feedback');
const quizBonusScore = document.getElementById('quiz-bonus-score');
const quizResults    = document.getElementById('quiz-results');
const resultsMiku    = document.getElementById('results-miku');
const resultsCorrect = document.getElementById('results-correct');
const resultsBonus   = document.getElementById('results-bonus');
const resultsMessage = document.getElementById('results-message');
const resultsTimer   = document.getElementById('results-timer');
const appEl          = document.getElementById('app');
const loadingEl      = document.getElementById('loading');
const loadingText    = document.getElementById('loading-text');
const bgEl           = document.getElementById('bg');
const phraseEl       = document.getElementById('lyric-phrase');
const translationEl  = document.getElementById('lyric-translation');
const mikuImg        = document.getElementById('miku-img');
const btnPlay        = document.getElementById('btn-play');
const btnStop        = document.getElementById('btn-stop');
const seekFill       = document.getElementById('seek-fill');
const timeDisplay    = document.getElementById('time-display');
const scoreEl        = document.getElementById('score');
const comboEl        = document.getElementById('combo');
const comboWrap      = document.getElementById('combo-wrap');
const gameNotesField = document.getElementById('game-notes-field');
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
    question: "What is the name of Miku's iconic accessory that she wears on her head?",
    answers: ["Headphones", "A crown", "A headset / microphone unit", "Cat ears"],
    correct: 2,
  },
];

const QUIZ_CORRECT_BONUS  =  200;
const QUIZ_WRONG_PENALTY  = -100;

let currentQuestion  = 0;
let quizBonusTotal   = 0;
let quizCorrectCount = 0;
let quizAnswered     = false;

function showQuiz() {
  quizScreen.classList.remove('hidden');
  // Switch bg to level 1 dark theme
  bgEl.style.background = 'linear-gradient(135deg, #0a1a0a, #0d0d0d, #1a0010, #0a1a0a)';
  bgEl.style.backgroundSize = '300% 300%';
  bgEl.style.animation = 'level1Gradient 6s ease infinite';
  loadQuestion(0);
}

function loadQuestion(index) {
  const q = QUIZ_QUESTIONS[index];
  quizAnswered = false;
  currentQuestion = index;

  // Update progress
  quizQNum.textContent = index + 1;
  quizProgressFill.style.width = (index / QUIZ_QUESTIONS.length * 100) + '%';

  // Set question text with slide-in
  quizQuestion.style.opacity = '0';
  quizQuestion.style.transform = 'translateY(10px)';
  setTimeout(() => {
    quizQuestion.textContent = q.question;
    quizQuestion.style.transition = 'opacity 0.3s, transform 0.3s';
    quizQuestion.style.opacity = '1';
    quizQuestion.style.transform = 'translateY(0)';
  }, 100);

  // Clear feedback
  quizFeedback.textContent = '';
  quizFeedback.className = '';

  // Build answer buttons
  quizAnswers.innerHTML = '';
  q.answers.forEach((answer, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-answer-btn';
    btn.textContent = answer;
    btn.addEventListener('click', () => handleAnswer(i, btn));
    // Stagger animation in
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(8px)';
    quizAnswers.appendChild(btn);
    setTimeout(() => {
      btn.style.transition = 'opacity 0.3s, transform 0.3s, background 0.15s, border-color 0.15s, box-shadow 0.15s';
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    }, 150 + i * 80);
  });
}

function handleAnswer(selectedIndex, btn) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q = QUIZ_QUESTIONS[currentQuestion];
  const allBtns = quizAnswers.querySelectorAll('.quiz-answer-btn');

  // Disable all buttons
  allBtns.forEach(b => b.classList.add('disabled'));

  if (selectedIndex === q.correct) {
    // Correct!
    btn.classList.remove('disabled');
    btn.classList.add('correct');
    quizBonusTotal += QUIZ_CORRECT_BONUS;
    quizCorrectCount++;
    quizFeedback.textContent = '✓ Correct! +' + QUIZ_CORRECT_BONUS + ' points!';
    quizFeedback.className = 'correct';
    quizBonusScore.textContent = quizBonusTotal.toLocaleString();
    quizMiku.classList.add('correct');
    setTimeout(() => quizMiku.classList.remove('correct'), 500);
    for (let i = 0; i < 15; i++) spawnParticleAt(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight, true
    );
  } else {
    // Wrong -- show selected as wrong, reveal correct
    btn.classList.remove('disabled');
    btn.classList.add('wrong');
    allBtns[q.correct].classList.remove('disabled');
    allBtns[q.correct].classList.add('reveal');
    quizBonusTotal += QUIZ_WRONG_PENALTY;
    quizFeedback.textContent = '✗ Not quite! -' + Math.abs(QUIZ_WRONG_PENALTY) + ' points';
    quizFeedback.className = 'wrong';
    quizBonusScore.textContent = quizBonusTotal.toLocaleString();
    quizMiku.classList.add('wrong');
    setTimeout(() => quizMiku.classList.remove('wrong'), 500);
    // Red flash
    const flash = document.createElement('div');
    flash.className = 'penalty-flash';
    document.body.appendChild(flash);
    flash.addEventListener('animationend', () => flash.remove());
  }

  // Advance after delay
  setTimeout(() => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      // Fade out current, load next
      quizQuestion.style.opacity = '0';
      quizAnswers.style.opacity = '0';
      quizFeedback.style.opacity = '0';
      setTimeout(() => {
        quizAnswers.style.opacity = '1';
        quizFeedback.style.opacity = '1';
        loadQuestion(currentQuestion + 1);
      }, 350);
    } else {
      // All done -- show results
      showQuizResults();
    }
  }, 1800);
}

function showQuizResults() {
  quizProgressFill.style.width = '100%';
  quizScreen.classList.add('hidden');
  quizResults.classList.remove('hidden');

  resultsCorrect.textContent = `${quizCorrectCount} / ${QUIZ_QUESTIONS.length} correct`;
  const bonusText = quizBonusTotal >= 0 ? `+${quizBonusTotal} bonus points!` : `${quizBonusTotal} points`;
  resultsBonus.textContent = bonusText;
  resultsBonus.style.color = quizBonusTotal >= 0 ? '#00ff88' : '#ff4444';

  if (quizCorrectCount === 4) {
    resultsMessage.textContent = '🌟 Perfect Score! You know your Miku! 🌟';
  } else if (quizCorrectCount === 3) {
    resultsMessage.textContent = '🎵 Great job! Almost perfect!';
  } else if (quizCorrectCount === 2) {
    resultsMessage.textContent = '💙 Not bad! Keep learning about Miku!';
  } else {
    resultsMessage.textContent = '🎶 Keep practicing -- you\'ll get it!';
  }

  // Countdown to game
  let timeLeft = 3;
  resultsTimer.textContent = timeLeft;
  const countdown = setInterval(() => {
    timeLeft--;
    resultsTimer.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      startGame();
    }
  }, 1000);
}

function startGame() {
  quizResults.classList.add('hidden');
  appEl.classList.remove('hidden');
  // Apply quiz bonus to starting score
  score = quizBonusTotal;
  scoreEl.textContent = score.toLocaleString();
  scoreEl.classList.toggle('negative', score < 0);
}

// ══════════════════════════════════
//   INTRO NOTE CATCHING GAME
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
  }, { passive:false });
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
  // Transition to quiz after celebration
  setTimeout(() => {
    introScreen.classList.add('hidden');
    showQuiz();
  }, 2200);
}

spawnInterval = setInterval(spawnIntroNote, 900);
setTimeout(spawnIntroNote, 100);
setTimeout(spawnIntroNote, 400);
setTimeout(spawnIntroNote, 700);

// ══════════════════════════════════
//   IN-GAME SCORING
// ══════════════════════════════════

let score        = 0;
let combo        = 0;
let comboTimeout = null;
let gameInterval = null;
let gameRunning  = false;

function spawnGameItem() {
  if (!gameRunning) return;
  const rand = Math.random();
  if (rand < 0.65)      spawnGameNote();
  else if (rand < 0.83) spawnGameMiku();
  else                  spawnGameFlag();
}

function spawnGameNote() {
  const el     = document.createElement('div');
  el.className = 'game-note';
  const symbol = NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)];
  const color  = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
  const x      = 40 + Math.random() * (window.innerWidth - 120);
  const dur    = 3 + Math.random() * 2;
  const size   = 2.2 + Math.random() * 1.2;
  el.textContent = symbol;
  el.style.cssText = `left:${x}px;top:-80px;color:${color};font-size:${size}rem;animation-duration:${dur}s;text-shadow:0 0 14px ${color}`;
  el.addEventListener('click', (e) => catchGameNote(el, e.clientX, e.clientY, symbol, color));
  el.addEventListener('touchstart', (e) => {
    e.preventDefault();
    catchGameNote(el, e.touches[0].clientX, e.touches[0].clientY, symbol, color);
  }, { passive:false });
  gameNotesField.appendChild(el);
  el.addEventListener('animationend', () => {
    if (!el.dataset.caught) missItem();
    el.remove();
  });
}

function spawnGameMiku() {
  const el     = document.createElement('img');
  el.className = 'game-miku';
  el.src       = 'miku_image.png';
  el.alt       = 'Miku bonus!';
  const x      = 40 + Math.random() * (window.innerWidth - 130);
  const dur    = 3.5 + Math.random() * 2;
  el.style.cssText = `left:${x}px;top:-80px;animation-duration:${dur}s`;
  el.addEventListener('click', (e) => catchMikuBonus(el, e.clientX, e.clientY));
  el.addEventListener('touchstart', (e) => {
    e.preventDefault();
    catchMikuBonus(el, e.touches[0].clientX, e.touches[0].clientY);
  }, { passive:false });
  gameNotesField.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function spawnGameFlag() {
  const el     = document.createElement('img');
  el.className = 'game-flag';
  el.src       = 'union_jack.png';
  el.alt       = 'Union Jack';
  const x      = 40 + Math.random() * (window.innerWidth - 120);
  const dur    = 3.2 + Math.random() * 2;
  el.style.cssText = `left:${x}px;top:-80px;animation-duration:${dur}s`;
  el.addEventListener('click', (e) => catchFlag(el, e.clientX, e.clientY));
  el.addEventListener('touchstart', (e) => {
    e.preventDefault();
    catchFlag(el, e.touches[0].clientX, e.touches[0].clientY);
  }, { passive:false });
  gameNotesField.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function catchGameNote(el, x, y, symbol, color) {
  if (el.dataset.caught) return;
  el.dataset.caught = 'true'; el.remove();
  combo++;
  const points = 10 * Math.min(combo, 8);
  addScore(points);
  updateCombo();
  showPointsPopup(x, y, `+${points}`, color, combo >= 3);
  popEffect(x, y, symbol, color);
  for (let i = 0; i < 4; i++) spawnParticleAt(x, y, true);
  mikuImg.classList.add('beat');
  setTimeout(() => mikuImg.classList.remove('beat'), 200);
  clearTimeout(comboTimeout);
  comboTimeout = setTimeout(() => { combo = 0; updateCombo(); }, 2500);
}

function catchMikuBonus(el, x, y) {
  if (el.dataset.caught) return;
  el.dataset.caught = 'true'; el.remove();
  addScore(500); combo++;
  updateCombo();
  showPointsPopup(x, y, '+500 ★ MIKU BONUS!', '#39C5BB', false, true);
  for (let i = 0; i < 12; i++) spawnParticleAt(x, y, true);
  mikuImg.classList.add('beat');
  setTimeout(() => mikuImg.classList.remove('beat'), 300);
  clearTimeout(comboTimeout);
  comboTimeout = setTimeout(() => { combo = 0; updateCombo(); }, 2500);
}

function catchFlag(el, x, y) {
  if (el.dataset.caught) return;
  el.dataset.caught = 'true'; el.remove();
  addScore(-500); combo = 0; updateCombo();
  showPointsPopup(x, y, '-500 🇬🇧 OOPS!', '#ff4444', false, false, true);
  const flash = document.createElement('div');
  flash.className = 'penalty-flash';
  document.body.appendChild(flash);
  flash.addEventListener('animationend', () => flash.remove());
}

function missItem() {
  if (combo > 0) { combo = 0; updateCombo(); }
}

function addScore(amount) {
  score += amount;
  scoreEl.textContent = score.toLocaleString();
  scoreEl.classList.toggle('negative', score < 0);
  scoreEl.classList.remove('pop');
  void scoreEl.offsetWidth;
  scoreEl.classList.add('pop');
  setTimeout(() => scoreEl.classList.remove('pop'), 200);
}

function updateCombo() {
  if (combo >= 2) {
    comboWrap.className = 'show' + (combo >= 5 ? ' hot' : combo >= 3 ? ' warm' : '');
    comboEl.textContent = combo;
  } else {
    comboWrap.className = '';
  }
}

function showPointsPopup(x, y, text, color, big=false, bonus=false) {
  const el = document.createElement('div');
  el.className = 'points-popup' + (bonus ? ' bonus' : big ? ' big' : '');
  el.textContent = text;
  el.style.cssText = `left:${Math.min(x-20, window.innerWidth-220)}px;top:${y-10}px;color:${color};text-shadow:0 0 10px ${color}`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function startGameNotes() {
  if (gameRunning) return;
  gameRunning = true;
  gameInterval = setInterval(spawnGameItem, 1100);
}

function stopGameNotes() {
  gameRunning = false;
  clearInterval(gameInterval);
  gameNotesField.querySelectorAll('.game-note,.game-miku,.game-flag').forEach(n => n.remove());
  combo = 0; updateCombo();
}

// ══════════════════════════════════
//   PARTICLES
// ══════════════════════════════════

let particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function spawnParticleAt(x, y, energized) {
  const colors = ['#39C5BB','#FF69B4','#00FFFF','#ffffff','#FFB7DD'];
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
//   TRANSLATIONS
// ══════════════════════════════════

const translations = {
  '照らし出して！':'Light it up!','グリーンライツ':'Green Lights',
  '広がる未来を':'Spreading toward the future','きっと':'Surely','いつか':'Someday',
  'キミを照らすまで':'Until I can light your way',
  '改めて言うことでもないけど':'It goes without saying, but',
  '今だからこそ':'Right now, of all times','言わせて':'Let me say it',
  'あの日キミが見つけてくれること':'That you would find me that day',
  '何となく予感してたんだ':'I had a feeling somehow','走り出した':'I started running',
  'キミにもっと':'I want to give you more','チカラをあげたくて':'The strength to keep going',
  'ずっと':'Always','前に':'Forward','ココロ決めたんだ':"I've made up my mind",
  '遥かな未来を':'Toward the distant future','今までもいつまでも':'Now and forever',
  '隣に居たいのは':'The reason I want to be by your side',
  '輝いたキミの顔':'Is to see your shining face','間近で見たいから！':'Up close!',
  '言葉は時に無力で':'Words can be powerless at times','なかなか':'And yet',
  'この世界は変わらないけど':"The world doesn't change easily",
  'もしキミが持ってるその魔法で':'But if that magic you hold',
  '新しい世界を作れるとしたら？':'Could create a brand new world?',
  'なんてね':'Just kidding','言ってみただけ':'I only said it',
  '「好き」をもっと':'Believe in what you love','信じるのさ':'More and more',
  '何度転んでも':'No matter how many times you fall',
  'キミはキミの':"You're you",'やり方でいいのだ！':'And that is perfectly fine!',
  '立ち向かう未来を':'Toward a future you can face',
  '堪え切れない夜には':'On nights you can barely endure',
  '隣で泣いていいよ':'You can cry right beside me',
  '二人だけの秘密も':'Our secret just between us','嬉しいんだよ':'Makes me so happy',
  '振り返ると遠く手を振ってくれるキミも':'You waving from afar as I look back',
  'この先のどこかで出会えるキミも':'And a you I may meet somewhere ahead',
  '誰にも真似できないあなたを抱きしめて':'I embrace the you no one else can imitate',
  '虹色の輝き':'The rainbow-colored brilliance',
  'Clap to the Beat':'Clap to the Beat','Full Speed':'Full Speed',
};

function getTranslation(phrase) {
  if (!phrase) return '';
  if (translations[phrase.trim()]) return translations[phrase.trim()];
  for (const [jp, en] of Object.entries(translations)) { if (phrase.includes(jp)) return en; }
  if (/^[A-Za-z0-9\s!?,.'&♪♫]+$/.test(phrase.trim())) return phrase.trim();
  return '';
}

function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.floor(ms/1000);
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}

function triggerAnimation(el, cls) {
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
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
    loadingText.textContent = 'Ready!';
    setTimeout(() => loadingEl.classList.add('hidden'), 600);
    btnPlay.disabled = false; btnStop.disabled = false;
  },
  onTimeUpdate(position) {
    if (player.data?.song?.length) {
      seekFill.style.width = (position / player.data.song.length * 100) + '%';
      timeDisplay.textContent = formatTime(position) + ' / ' + formatTime(player.data.song.length);
    }
    if (Math.random() < 0.12) spawnParticle(false);
    const phrase = player.video.findPhrase(position);
    if (phrase?.text && phraseEl.textContent !== phrase.text) {
      phraseEl.textContent = phrase.text;
      triggerAnimation(phraseEl, 'phrase-fade');
      const t = getTranslation(phrase.text);
      translationEl.textContent = t;
      if (t) triggerAnimation(translationEl, 'translation-fade');
    }
    const beat = player.findBeat(position);
    if (beat && Math.abs(position - beat.startTime) < 30) {
      beatFlash.classList.remove('flash'); void beatFlash.offsetWidth; beatFlash.classList.add('flash');
      mikuImg.classList.add('beat'); setTimeout(() => mikuImg.classList.remove('beat'), 200);
    }
  },
  onPlay()  { bgEl.classList.add('playing');    btnPlay.textContent='⏸ PAUSE'; startGameNotes(); },
  onPause() { bgEl.classList.remove('playing'); btnPlay.textContent='▶ PLAY';  stopGameNotes(); },
  onStop()  {
    bgEl.classList.remove('playing'); btnPlay.textContent='▶ PLAY';
    seekFill.style.width='0%'; phraseEl.textContent=''; translationEl.textContent='';
    stopGameNotes();
    if (score !== 0 || quizBonusTotal !== 0) {
      const final = document.createElement('div');
      final.id = 'final-score';
      final.innerHTML = `
        <div class="final-score-title">🎉 Final Score</div>
        <div class="final-score-number ${score >= 0 ? 'positive' : 'negative'}">${score.toLocaleString()}</div>
        <div class="final-score-sub">${score >= 0 ? 'Amazing! Play again to beat it!' : "Don't catch the flags next time! 🇬🇧"}</div>`;
      document.body.appendChild(final);
      setTimeout(() => final.classList.add('show'), 50);
      setTimeout(() => { final.classList.remove('show'); setTimeout(() => final.remove(), 600); }, 4500);
      score = 0; combo = 0; updateCombo();
      scoreEl.textContent = '0'; scoreEl.classList.remove('negative');
    }
  },
  onError(err) { console.error('TextAlive error:', err); loadingText.textContent = 'Error loading. Check console (F12).'; },
});

btnPlay.addEventListener('click', () => player.isPlaying ? player.requestPause() : player.requestPlay());
btnStop.addEventListener('click', () => player.requestStop());

function loop() { updateParticles(); requestAnimationFrame(loop); }
loop();

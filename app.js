// ============================================
//   グリーンライツ・セレナーデ / 初音ミク
//   Lyric App — powered by TextAlive App API
// ============================================

const loadingEl   = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const bgEl        = document.getElementById('bg');
const beatRingEl  = document.getElementById('beat-ring');
const charEl      = document.getElementById('lyric-char');
const wordEl      = document.getElementById('lyric-word');
const phraseEl    = document.getElementById('lyric-phrase');
const btnPlay     = document.getElementById('btn-play');
const btnStop     = document.getElementById('btn-stop');
const seekFill    = document.getElementById('seek-fill');
const timeDisplay = document.getElementById('time-display');
const canvas      = document.getElementById('particles');
const ctx         = canvas.getContext('2d');

const beatFlash = document.createElement('div');
beatFlash.id = 'beat-flash';
document.body.appendChild(beatFlash);

// ============================================
//   PARTICLES
// ============================================

let particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function spawnParticle(energized) {
  const colors = ['#39C5BB', '#FF69B4', '#00FFFF', '#ffffff', '#FFB7DD'];
  particles.push({
    x:       Math.random() * canvas.width,
    y:       Math.random() * canvas.height,
    size:    Math.random() * (energized ? 5 : 3) + 1,
    speedX:  (Math.random() - 0.5) * (energized ? 2 : 0.8),
    speedY:  -(Math.random() * (energized ? 3 : 1.5) + 0.5),
    opacity: Math.random() * 0.8 + 0.2,
    fade:    Math.random() * 0.01 + 0.005,
    color:   colors[Math.floor(Math.random() * colors.length)],
  });
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
    p.x       += p.speedX;
    p.y       += p.speedY;
    p.opacity -= p.fade;
  }
}

// ============================================
//   HELPERS
// ============================================

function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function triggerAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function onBeat() {
  beatRingEl.classList.remove('pulse');
  void beatRingEl.offsetWidth;
  beatRingEl.classList.add('pulse');
  setTimeout(() => beatRingEl.classList.remove('pulse'), 150);
  beatFlash.classList.remove('flash');
  void beatFlash.offsetWidth;
  beatFlash.classList.add('flash');
  for (let i = 0; i < 8; i++) spawnParticle(true);
}

// ============================================
//   TEXTALIVE PLAYER
// ============================================

const { Player } = TextAliveApp;

const player = new Player({
  app: { token: 'xNOQIXmn2fgnogyi' },
  mediaElement: document.querySelector('#media'),
});

// ============================================
//   EVENT LISTENERS
// ============================================

player.addListener({

  onAppReady(app) {
    // If the TextAlive host provides a song, use it.
    // If running standalone, load our song ourselves.
    if (!app.songUrl) {
      player.createFromSongUrl('https://piapro.jp/t/61Y2', {
        video: {
          beatId: 3953882,
          chordId: 2727635,
          repetitiveSegmentId: 2824327,
          lyricId: 59415,
          lyricDiffId: 13962,
        }
      });
    }
  },

  onVideoReady(video) {
    loadingText.textContent = 'Ready! Press Play!';
    setTimeout(() => loadingEl.classList.add('hidden'), 800);
    btnPlay.disabled = false;
    btnStop.disabled = false;
  },

  onTimeUpdate(position) {
    if (player.data && player.data.song && player.data.song.length) {
      const pct = (position / player.data.song.length) * 100;
      seekFill.style.width = pct + '%';
      timeDisplay.textContent =
        formatTime(position) + ' / ' + formatTime(player.data.song.length);
    }

    if (Math.random() < 0.3) spawnParticle(false);

    const char = player.video.findChar(position);
    if (char && char.text && char.text.trim()) {
      charEl.textContent = char.text;
      triggerAnimation(charEl, 'char-pop');
    }

    const word = player.video.findWord(position);
    if (word && word.text) {
      if (wordEl.textContent !== word.text) {
        wordEl.textContent = word.text;
        triggerAnimation(wordEl, 'word-slide');
      }
    }

    const phrase = player.video.findPhrase(position);
    if (phrase && phrase.text) {
      if (phraseEl.textContent !== phrase.text) {
        phraseEl.textContent = phrase.text;
        triggerAnimation(phraseEl, 'phrase-fade');
      }
    }

    const beat = player.findBeat(position);
    if (beat && beat.startTime !== undefined) {
      if (Math.abs(position - beat.startTime) < 30) onBeat();
    }
  },

  onPlay()  {
    bgEl.classList.add('playing');
    btnPlay.textContent = '⏸ PAUSE';
  },

  onPause() {
    bgEl.classList.remove('playing');
    btnPlay.textContent = '▶ PLAY';
  },

  onStop()  {
    bgEl.classList.remove('playing');
    btnPlay.textContent  = '▶ PLAY';
    seekFill.style.width = '0%';
    charEl.textContent   = '';
    wordEl.textContent   = '';
    phraseEl.textContent = '';
  },

  onError(err) {
    console.error('TextAlive error:', err);
    loadingText.textContent = 'Error loading song. Check console (F12) for details.';
  },

});

// ============================================
//   BUTTON CONTROLS
// ============================================

btnPlay.addEventListener('click', () => {
  if (player.isPlaying) {
    player.requestPause();
  } else {
    player.requestPlay();
  }
});

btnStop.addEventListener('click', () => {
  player.requestStop();
});

// ============================================
//   ANIMATION LOOP
// ============================================

function loop() {
  updateParticles();
  requestAnimationFrame(loop);
}
loop();

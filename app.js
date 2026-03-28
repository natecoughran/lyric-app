// ============================================
//   グリーンライツ・セレナーデ / 初音ミク
//   Lyric App — powered by TextAlive App API
// ============================================

const loadingEl      = document.getElementById('loading');
const loadingText    = document.getElementById('loading-text');
const bgEl           = document.getElementById('bg');
const beatRingEl     = document.getElementById('beat-ring');
const charEl         = document.getElementById('lyric-char');
const wordEl         = document.getElementById('lyric-word');
const phraseEl       = document.getElementById('lyric-phrase');
const translationEl  = document.getElementById('lyric-translation');
const mikuEl         = document.getElementById('miku');
const btnPlay        = document.getElementById('btn-play');
const btnStop        = document.getElementById('btn-stop');
const seekFill       = document.getElementById('seek-fill');
const timeDisplay    = document.getElementById('time-display');
const canvas         = document.getElementById('particles');
const ctx            = canvas.getContext('2d');

const beatFlash = document.createElement('div');
beatFlash.id = 'beat-flash';
document.body.appendChild(beatFlash);

// ============================================
//   LYRIC TRANSLATIONS
//   Japanese phrase → English translation
// ============================================

const translations = {
  // Verse 1
  '照らし出して！': 'Light it up!',
  'グリーンライツ': 'Green Lights',
  '広がる未来を': 'Spreading toward the future',
  'きっと': 'Surely',
  'いつか': 'Someday',
  'キミを照らすまで': 'Until I can light your way',
  '改めて言うことでもないけど': "It goes without saying, but",
  '今だからこそ': 'Right now, of all times',
  '言わせて': 'Let me say it',
  'あの日キミが見つけてくれること': 'That you would find me that day',
  '何となく予感してたんだ': 'I had a feeling somehow',
  '走り出した': 'I started running',
  'キミにもっと': 'I want to give you more',
  'チカラをあげたくて': 'The strength to keep going',
  'ずっと': 'Always',
  '前に': 'Forward',
  'ココロ決めたんだ': "I've made up my mind",
  // Chorus
  '遥かな未来を': 'Toward the distant future',
  '今までもいつまでも': 'Now and forever',
  '隣に居たいのは': 'The reason I want to be by your side',
  '輝いたキミの顔': 'Is to see your shining face',
  '間近で見たいから！': 'Up close!',
  // Verse 2
  '言葉は時に無力で': 'Words can be powerless at times',
  'なかなか': 'And yet',
  'この世界は変わらないけど': "The world doesn't change easily",
  'もしキミが持ってるその魔法で': 'But if that magic you hold',
  '新しい世界を作れるとしたら？': 'Could create a brand new world?',
  'なんてね': 'Just kidding',
  '言ってみただけ': 'I only said it',
  'そんなの': 'Something like that',
  '本当は出来る訳無い': "Could never really happen... right?",
  'ワケがないでしょ！': "There's no way!",
  '「好き」をもっと': 'Believe in "I love this"',
  '信じるのさ': 'More and more',
  '何度転んでも': 'No matter how many times you fall',
  'キミはキミの': "You're you",
  'やり方でいいのだ！': 'And that is perfectly fine!',
  // Verse 3
  '立ち向かう未来を': 'Toward a future you can face',
  '堪え切れない夜には': 'On nights you can barely endure',
  '隣で泣いていいよ': 'You can cry right beside me',
  '二人だけの秘密も': 'Our secret just between us',
  '嬉しいんだよ': 'Makes me so happy',
  // Bridge
  '振り返ると遠く手を振ってくれるキミも': 'You waving to me from afar as I look back',
  'この先のどこかで出会えるキミも': 'And a you I may meet somewhere ahead',
  '誰にも真似できないあなたを抱きしめて': 'I embrace the you that no one else can imitate',
  '虹色の輝き': 'The rainbow-colored brilliance',
  // Clap section
  'Clap to the Beat': 'Clap to the Beat',
  'Full Speed': 'Full Speed',
};

function getTranslation(phrase) {
  if (!phrase) return '';
  // Try exact match first
  if (translations[phrase.trim()]) return translations[phrase.trim()];
  // Try partial match
  for (const [jp, en] of Object.entries(translations)) {
    if (phrase.includes(jp)) return en;
  }
  // If it's already English/Latin characters, show it as-is
  if (/^[A-Za-z0-9\s!?,.'&♪♫]+$/.test(phrase.trim())) return phrase.trim();
  return '';
}

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

  // Miku glows on beat
  mikuEl.classList.add('beat');
  setTimeout(() => mikuEl.classList.remove('beat'), 200);

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

    // Current phrase + translation
    const phrase = player.video.findPhrase(position);
    if (phrase && phrase.text) {
      if (phraseEl.textContent !== phrase.text) {
        phraseEl.textContent = phrase.text;
        triggerAnimation(phraseEl, 'phrase-fade');

        const translation = getTranslation(phrase.text);
        translationEl.textContent = translation;
        if (translation) {
          triggerAnimation(translationEl, 'translation-fade');
        }
      }
    }

    // Beat detection
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
    phraseEl.textContent = '';
    translationEl.textContent = '';
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

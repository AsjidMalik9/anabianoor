import { unlock, sfx, isMuted, setMuted } from './audio.js'

// Prefer HTTPS in the address bar (fixes lingering “Not Secure” on http://)
if (location.protocol === 'http:' && location.hostname.endsWith('anabianoor.com')) {
  location.replace(`https://${location.host}${location.pathname}${location.search}${location.hash}`)
}

const LEO = '/assets/95cd76ec584c06feb00fea19b44f82fa.png'
const LEO_HEAD = '/assets/7d320cd100d2e470748a088899d68db2.png'
const ANABIA = '/assets/3ff70f0aba58875c123f0e3ff933b489.png'
const WING = '/assets/9bb3e9d787319358c5192545086f2eec.png'
const PHOTO = '/assets/aff68749fa47d8a408643af3b80fc706.jpg'
const PHOTO_POOL = '/assets/anabia-pool.jpg'
const PHOTO_DUCKS = '/assets/anabia-ducks.jpg'
const PHOTO_ADVENTURE = '/assets/anabia-adventure.jpg'

const WHO = ['Leo the cat', 'a brave princess', 'a tiny dragon', 'my teacher', 'a silly robot']
const WHERE = ['the moon', 'a candy forest', 'the bottom of the sea', 'a jungle full of monkeys', "a giant's kitchen"]
const WHAT = ['found a magic golden key', 'made friends with a talking fish', 'lost both shoes', 'rode down a rainbow slide', 'had a tea party with a bear']
const SPOT_NAMES = ['Bush', 'Box', 'Bed', 'Basket', 'Curtain', 'Tree']
const SPOT_COLORS = ['#7FD8BE', '#FFB067', '#C3B1FF', '#FF8FA3', '#8FD3F4', '#FFD23F']
const CARD_KINDS = ['leo', 'fish', 'yarn', 'star', 'moon', 'book']

const HEAD_ITEMS = ['hat', 'crown', 'explorer', 'flower']
const EYE_ITEMS = ['glasses', 'shades']
const WEAR_DEFAULT = {
  hat: false,
  crown: false,
  explorer: false,
  flower: false,
  glasses: false,
  shades: false,
  bow: false,
  scarf: false,
  cape: false,
  backpack: false,
  badge: false,
  mustache: false,
}
const SCENES = {
  sunny: { bg: 'linear-gradient(160deg,#FFF3A3 0%,#FFD23F 100%)', label: 'Sunny' },
  candy: { bg: 'linear-gradient(160deg,#FFD6E7 0%,#FF8FA3 100%)', label: 'Candy' },
  ocean: { bg: 'linear-gradient(160deg,#C9ECFF 0%,#8FD3F4 100%)', label: 'Ocean' },
  jungle: { bg: 'linear-gradient(160deg,#C8F5E4 0%,#7FD8BE 100%)', label: 'Jungle' },
  night: { bg: 'linear-gradient(160deg,#2A3350 0%,#1F2A44 100%)', label: 'Night' },
}

function loadWear() {
  try {
    const raw = JSON.parse(localStorage.getItem('leo-wear') || 'null')
    if (raw && typeof raw === 'object') return { ...WEAR_DEFAULT, ...raw }
  } catch {}
  return { ...WEAR_DEFAULT }
}

function loadScene() {
  try {
    const s = localStorage.getItem('leo-scene')
    if (s && SCENES[s]) return s
  } catch {}
  return 'sunny'
}

const state = {
  game: 'find',
  leoSpot: Math.floor(Math.random() * 6),
  opened: [],
  meow: false,
  deck: makeDeck(),
  flipped: [],
  matched: [],
  moves: 0,
  lock: false,
  fishAt: 4,
  score: 0,
  timeLeft: 20,
  running: false,
  played: false,
  best: 0,
  wear: loadWear(),
  scene: loadScene(),
  who: 0,
  where: 0,
  what: 0,
}

function saveWear() {
  try {
    localStorage.setItem('leo-wear', JSON.stringify(state.wear))
    localStorage.setItem('leo-scene', state.scene)
  } catch {}
}

function exclusiveToggle(group, key) {
  const on = !state.wear[key]
  group.forEach((k) => {
    state.wear[k] = false
  })
  state.wear[key] = on
}

let clock
let mover
let flipTimer

function makeDeck() {
  const d = CARD_KINDS.concat(CARD_KINDS).map((kind) => ({ kind }))
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[d[i], d[j]] = [d[j], d[i]]
  }
  return d
}

const app = document.getElementById('app')
app.innerHTML = `
  <header class="site-header" id="site-header">
    <nav class="nav">
      <a class="logo" href="#top">
        <img src="${LEO_HEAD}" alt="" width="44" height="32" />
        <span>Anabia's Story World</span>
      </a>
      <div class="nav-links" id="nav-links">
        <a class="pill yellow lift" href="#book">My Book</a>
        <a class="pill pink lift" href="#story">Funny Story</a>
        <a class="pill mint lift" href="#leo">Meet Leo</a>
        <a class="pill lilac lift" href="#games">Games</a>
        <a class="pill" href="#about" style="background:#C3B1FF">Meet Anabia</a>
      </div>
      <div class="nav-actions">
        <button type="button" class="mute-btn" id="mute" aria-label="Toggle sound">${isMuted() ? '🔇' : '🔊'}</button>
        <button type="button" class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  </header>

  <div class="play-bar" id="play-bar" hidden>
    <a href="#top" class="play-bar-back">← Home</a>
    <span class="play-bar-title">Games with Leo</span>
    <button type="button" class="mute-btn play-bar-mute" id="mute-play" aria-label="Toggle sound">${isMuted() ? '🔇' : '🔊'}</button>
  </div>

  <section class="hero" id="top">
    <div class="hero-sun" aria-hidden="true">
      <svg class="spin" width="150" height="150" viewBox="0 0 150 150">
        <g stroke="#FFD23F" stroke-width="8" stroke-linecap="round">
          <path d="M75 6 L75 24"/><path d="M75 126 L75 144"/><path d="M6 75 L24 75"/><path d="M126 75 L144 75"/>
          <path d="M26 26 L39 39"/><path d="M111 111 L124 124"/><path d="M26 124 L39 111"/><path d="M111 39 L124 26"/>
        </g>
        <circle cx="75" cy="75" r="40" fill="#FFD23F" stroke="#1F2A44" stroke-width="4"/>
      </svg>
    </div>
    <svg class="cloud drift" style="top:60px;left:38%" width="170" height="70" viewBox="0 0 170 70" aria-hidden="true"><g fill="#fff"><ellipse cx="50" cy="45" rx="45" ry="22"/><ellipse cx="95" cy="32" rx="40" ry="28"/><ellipse cx="128" cy="48" rx="38" ry="20"/></g></svg>
    <svg class="cloud drift" style="top:210px;right:4%;animation-duration:12s" width="200" height="80" viewBox="0 0 170 70" aria-hidden="true"><g fill="#fff"><ellipse cx="50" cy="45" rx="45" ry="22"/><ellipse cx="95" cy="32" rx="40" ry="28"/><ellipse cx="128" cy="48" rx="38" ry="20"/></g></svg>

    <div class="hero-inner">
      <div class="hero-copy">
        <p class="badge hop">YOUNG AUTHOR · GRADE 2</p>
        <h1>
          <span class="hero-hi sticker">Hi! I'm Anabia</span>
          <span class="hero-and">and I wrote</span>
          <span class="hero-book">A REAL BOOK!</span>
        </h1>
        <p class="hero-lead">Come on an adventure with me! Read my story, meet my fluffy cat Leo, and play 5 fun games.</p>
        <div class="cta-row">
          <a class="btn btn-yellow lift" href="#book">See my book</a>
          <a class="btn btn-white lift" href="#games">Play with Leo</a>
        </div>
      </div>
      <div class="hero-art">
        <div class="hero-stage">
          <div class="hero-circle" aria-hidden="true"></div>
          <svg class="hero-ring spin-slow" viewBox="0 0 396 396" aria-hidden="true"><circle cx="198" cy="198" r="190" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="4 18" stroke-linecap="round"/></svg>
          <svg class="hero-grass" viewBox="0 0 460 140" preserveAspectRatio="none" aria-hidden="true"><path d="M0 140 L0 78 C 50 18, 410 18, 460 78 L460 140 Z" fill="#6CC551" stroke="#1F2A44" stroke-width="4"/><path d="M90 70 l6 -14 l6 14 M220 58 l6 -14 l6 14 M300 62 l6 -14 l6 14 M370 80 l6 -14 l6 14" stroke="#3E8E2F" stroke-width="3" fill="none" stroke-linecap="round"/></svg>
          <div class="hero-anabia"><img src="${ANABIA}" alt="Anabia with her arms out wide, ready for adventure" /></div>
          <div class="hero-leo"><img src="${LEO}" alt="Leo the cat sitting next to Anabia" /></div>
          <div class="new-book">
            <svg class="spin-slow" style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 2 L58 20 L76 10 L74 30 L94 30 L82 46 L98 58 L78 64 L86 84 L66 78 L60 98 L50 82 L40 98 L34 78 L14 84 L22 64 L2 58 L18 46 L6 30 L26 30 L24 10 L42 20 Z" fill="#FF8FA3" stroke="#1F2A44" stroke-width="3" stroke-linejoin="round"/></svg>
            <span>NEW<br>BOOK!</span>
          </div>
          <div class="leo-says hop">Leo says hi!</div>
        </div>
      </div>
    </div>
    <svg class="wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,120 L0,60 L120,22 L260,70 L400,12 L560,75 L720,26 L880,80 L1040,16 L1200,70 L1340,30 L1440,60 L1440,120 Z" fill="#8B6CFF"/>
      <path d="M0,120 L0,90 L180,46 L340,95 L520,52 L700,100 L900,56 L1080,100 L1260,60 L1440,95 L1440,120 Z" fill="#5B3FD6"/>
    </svg>
  </section>

  <section class="section book-section" id="book">
    <svg class="twinkle" style="position:absolute;top:60px;left:8%" width="34" height="34" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#FFD23F"/></svg>
    <svg class="twinkle" style="position:absolute;top:140px;right:10%;animation-delay:.8s" width="26" height="26" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#fff"/></svg>
    <div class="section-inner book-layout">
      <div class="book-cover-wrap">
        <div class="book-cover">
          <img class="book-wing swish" src="${WING}" alt="" width="120" />
          <div class="book-spine-row">
            <div class="book-spine"></div>
            <div class="book-front">
              <p class="title">Leo, Let's Go!</p>
              <p style="margin:0;font-size:15px;font-weight:700">First storybook!</p>
              <p class="by">by Anabia</p>
            </div>
          </div>
        </div>
      </div>
      <div class="book-copy">
        <p class="chip">MY FIRST BOOK</p>
        <h2 class="section-title sticker">Leo, Let's Go!</h2>
        <p style="margin:0;font-size:20px;line-height:1.6;font-weight:700">Anabia packs her notebook. Leo packs a snack. Together they follow the sunny path — and find a surprise worth writing about!</p>
        <div class="meta-grid">
          <div class="meta-card" style="background:#FF8FA3;transform:rotate(-2deg)"><p class="label">Type</p><p class="value">Adventure</p></div>
          <div class="meta-card" style="background:#7FD8BE;transform:rotate(1.5deg)"><p class="label">Pages</p><p class="value">Coming soon</p></div>
          <div class="meta-card" style="background:#FFD23F;transform:rotate(-1deg)"><p class="label">Out on</p><p class="value">Soon!</p></div>
        </div>
        <div class="cta-row">
          <a class="btn btn-yellow btn-sm lift" href="#story">Read a funny story</a>
          <a class="btn btn-white btn-sm lift" href="#games">Play a game</a>
        </div>
      </div>
    </div>
    <svg class="wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z" fill="#FFE08A"/></svg>
  </section>

  <section class="section story-section" id="story">
    <div class="story-inner">
      <p class="game-chip" style="background:#1F2A44;color:#FFD23F;align-self:center">A TINY TALE</p>
      <h2 class="section-title sticker" style="text-align:center">Leo and the Secret Sock</h2>
      <p style="margin:0;text-align:center;font-weight:800;font-size:18px;color:var(--ink)">Tap Next to read Anabia's funny mini adventure!</p>
      <div class="story-reader" id="story-reader" aria-live="polite"></div>
    </div>
    <svg class="wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0,60 C240,0 480,120 720,60 C960,0 1200,120 1440,60 L1440,120 L0,120 Z" fill="#FFC2D1"/></svg>
  </section>

  <section class="section leo-section" id="leo">
    <svg class="paw" style="top:40px;right:6%;transform:rotate(20deg)" width="46" height="46" viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="27" rx="10" ry="8"/><circle cx="9" cy="15" r="4.5"/><circle cx="17" cy="9" r="4.5"/><circle cx="27" cy="10" r="4.5"/><circle cx="33" cy="17" r="4.5"/></svg>
    <div class="leo-layout">
      <div class="leo-stage-col">
        <div class="leo-circle">
          <p class="meow-bubble ${state.meow ? '' : 'hidden'}" id="meow-bubble">PURRR... MEOW!</p>
          <div id="leo-bob"><img src="${LEO}" alt="Leo, a fluffy Persian cat" /></div>
        </div>
        <button type="button" class="btn btn-accent lift" id="pet-leo">Pet Leo</button>
      </div>
      <div class="leo-copy">
        <p class="chip white">MY BEST FRIEND</p>
        <h2 class="section-title sticker">Meet Leo!</h2>
        <p style="margin:0;font-size:20px;line-height:1.6;font-weight:700">Leo is my big, fluffy Persian cat. He loves to peek at everything I do. Can you spot him hiding on this page?</p>
        <div class="fact-grid">
          <div class="fact lift" style="background:#FFD23F;transform:rotate(-2deg)"><p class="label">Kind of cat</p><p class="value">Persian</p></div>
          <div class="fact lift" style="background:#7FD8BE;transform:rotate(1.5deg)"><p class="label">Fur</p><p class="value">Super fluffy, brown</p></div>
          <div class="fact lift" style="background:#8FD3F4;transform:rotate(1deg)"><p class="label">Favorite snack</p><p class="value">Cheese bits</p></div>
          <div class="fact lift" style="background:#C3B1FF;transform:rotate(-1.5deg)"><p class="label">Silliest habit</p><p class="value">Peeking everywhere</p></div>
        </div>
      </div>
    </div>
    <svg class="wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0,60 C240,0 480,120 720,60 C960,0 1200,120 1440,60 L1440,120 L0,120 Z" fill="#FFD23F"/></svg>
  </section>

  <section class="section games-section" id="games">
    <div class="games-inner">
      <div class="games-header">
        <p class="game-chip">GAME TIME</p>
        <h2 class="section-title sticker">Let's Play with Leo!</h2>
        <p style="margin:0;font-size:20px;font-weight:800;color:var(--ink)">Pick a game below</p>
      </div>
      <div class="game-tabs" id="game-tabs"></div>
      <div class="game-board">
        <div class="game-panel" data-panel="find" id="panel-find"></div>
        <div class="game-panel" data-panel="memory" id="panel-memory"></div>
        <div class="game-panel" data-panel="catch" id="panel-catch"></div>
        <div class="game-panel" data-panel="dress" id="panel-dress"></div>
        <div class="game-panel" data-panel="story" id="panel-story"></div>
      </div>
    </div>
    <svg class="wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z" fill="#7FD8BE"/></svg>
  </section>

  <section class="section about-section" id="about" aria-labelledby="meet-anabia-heading">
    <div class="about-inner">
      <header class="about-intro">
        <p class="chip white">YOUNG AUTHOR</p>
        <h2 class="section-title sticker" id="meet-anabia-heading">Meet Anabia Noor</h2>
        <p class="about-seo-lead">Anabia Noor is a grade 2 author, storyteller, and the creator of <em>Leo, Let's Go!</em> — a kids adventure starring Leo the fluffy Persian cat.</p>
      </header>

      <div class="about-row">
        <div class="photo-wrap">
          <div class="photo-frame">
            <div class="photo-peek peek"><img src="${LEO_HEAD}" alt="Leo the fluffy Persian cat peeking over Anabia Noor's photo" width="200" height="160" /></div>
            <figure class="polaroid">
              <img src="${PHOTO}" alt="Anabia Noor, young author, sitting in the sand with a pink bow" width="288" height="280" loading="lazy" />
              <figcaption class="caption">Anabia Noor!</figcaption>
            </figure>
          </div>
        </div>
        <div class="about-copy">
          <p class="about-hi">Hi! My name is <strong>Anabia Noor</strong>. I am in grade 2 and I just wrote my very first book!</p>
          <p style="margin:0;font-size:20px;line-height:1.6;font-weight:700">I love adventures, writing stories, swimming, ducks, my fluffy cat Leo, and I love my sissy so much! This website is my story world — come play, then go find Leo in my book!</p>
          <p style="margin:0;font-size:18px;font-weight:800">
            Follow Anabia Noor on Instagram:
            <a href="https://www.instagram.com/anabicious/" target="_blank" rel="noopener noreferrer" style="color:#5B3FD6;text-decoration:none;border-bottom:3px solid #FFD23F">@anabicious</a>
          </p>
          <div class="stat-row">
            <div class="stat-card lift" style="transform:rotate(-2deg)"><p class="num" style="color:#5B3FD6">2</p><p class="lbl">grade</p></div>
            <div class="stat-card lift" style="transform:rotate(1.5deg)"><p class="num" style="color:#D62839">1</p><p class="lbl">book written</p></div>
            <div class="stat-card lift" style="transform:rotate(-1deg)"><p class="num" style="color:#0F6E6E">1</p><p class="lbl">fluffy cat</p></div>
          </div>
        </div>
      </div>

      <div class="anabia-gallery-block">
        <h3 class="section-title sticker" style="font-size:clamp(28px,5vw,44px)">Anabia's adventures</h3>
        <p class="gallery-lead">Real photos of young author Anabia Noor — swimming, feeding ducks, and exploring!</p>
        <div class="anabia-gallery">
          <figure class="gallery-shot lift" style="--tilt:-3deg">
            <img src="${PHOTO_POOL}" alt="Anabia Noor swimming in a blue pool with pink floaties" width="528" height="720" loading="lazy" />
            <figcaption>Pool day!</figcaption>
          </figure>
          <figure class="gallery-shot lift" style="--tilt:2deg">
            <img src="${PHOTO_DUCKS}" alt="Anabia Noor hugging a Hello Kitty plush by a duck pond" width="538" height="712" loading="lazy" />
            <figcaption>Duck friends</figcaption>
          </figure>
          <figure class="gallery-shot lift" style="--tilt:-2deg">
            <img src="${PHOTO_ADVENTURE}" alt="Anabia Noor on a fun adventure at Dome with explorer friends" width="528" height="702" loading="lazy" />
            <figcaption>Explorer mode</figcaption>
          </figure>
        </div>
      </div>

      <h3 class="section-title sticker" style="font-size:clamp(32px,6vw,52px)">How Anabia made her book</h3>
      <div class="steps">
        <div class="step lift">
          <p class="step-num" style="background:#FFD23F">1</p>
          <p style="margin:0;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:26px">I dreamed up an idea</p>
          <p style="margin:0;font-size:17px;line-height:1.5;font-weight:700">An adventure with Leo exploring somewhere brand new!</p>
        </div>
        <div class="step lift">
          <p class="step-num" style="background:#FF8FA3">2</p>
          <p style="margin:0;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:26px">I wrote it all down</p>
          <p style="margin:0;font-size:17px;line-height:1.5;font-weight:700">Words, pictures, and lots of brave little steps.</p>
        </div>
        <div class="step lift">
          <p class="step-num" style="background:#C3B1FF">3</p>
          <p style="margin:0;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:26px">It became a real book!</p>
          <p style="margin:0;font-size:17px;line-height:1.5;font-weight:700">Now you can meet Leo here — and in the story!</p>
        </div>
      </div>
      <h3 class="section-title sticker" style="font-size:clamp(32px,6vw,52px)">Things Anabia loves</h3>
      <div class="loves">
        <div class="love lift" style="background:#FF8FA3;transform:rotate(-2deg)"><p style="margin:0;font-size:16px;font-weight:700">I love</p><p style="margin:6px 0 0;font-family:'Luckiest Guy',sans-serif;font-size:30px;letter-spacing:1px">My sissy!</p></div>
        <div class="love lift" style="background:#FFD23F;transform:rotate(1.5deg)"><p style="margin:0;font-size:16px;font-weight:700">My favorite color</p><p style="margin:6px 0 0;font-family:'Luckiest Guy',sans-serif;font-size:30px;letter-spacing:1px">Pink!</p></div>
        <div class="love lift" style="background:#8FD3F4;transform:rotate(-1deg)"><p style="margin:0;font-size:16px;font-weight:700">I love to</p><p style="margin:6px 0 0;font-family:'Luckiest Guy',sans-serif;font-size:30px;letter-spacing:1px">Write stories</p></div>
        <div class="love lift" style="background:#C3B1FF;transform:rotate(2deg)"><p style="margin:0;font-size:16px;font-weight:700">When I grow up</p><p style="margin:6px 0 0;font-family:'Luckiest Guy',sans-serif;font-size:30px;letter-spacing:1px">Author!</p></div>
      </div>
    </div>
  </section>

  <footer class="site-footer">
    <div class="footer-peek peek" aria-hidden="true"><img src="${LEO_HEAD}" alt="" width="130" /></div>
    <div class="footer-inner">
      <div>
        <p class="footer-brand">Anabia Noor's Story World</p>
        <p style="margin:8px 0 0;font-size:16px;font-weight:700">Official site for young author Anabia Noor · Made with love by my family (and Leo)</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
        <a href="https://www.instagram.com/anabicious/" target="_blank" rel="noopener noreferrer" style="color:#FFD23F;font-weight:900;font-size:18px;text-decoration:none">Instagram @anabicious</a>
        <a href="mailto:asjidmalik9@gmail.com" style="color:#FFF6DC;font-weight:800;font-size:16px;text-decoration:none">Contact: asjidmalik9@gmail.com</a>
      </div>
    </div>
  </footer>
`

const muteBtn = document.getElementById('mute')
const menuBtn = document.getElementById('menu-btn')
const navLinks = document.getElementById('nav-links')
const siteHeader = document.getElementById('site-header')

function closeMenu() {
  siteHeader.classList.remove('menu-open')
  menuBtn.setAttribute('aria-expanded', 'false')
  menuBtn.setAttribute('aria-label', 'Open menu')
}

function openMenu() {
  siteHeader.classList.add('menu-open')
  menuBtn.setAttribute('aria-expanded', 'true')
  menuBtn.setAttribute('aria-label', 'Close menu')
}

menuBtn.addEventListener('click', () => {
  if (siteHeader.classList.contains('menu-open')) closeMenu()
  else openMenu()
})

navLinks.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => closeMenu())
})

muteBtn.addEventListener('click', async () => {
  await unlock()
  setMuted(!isMuted())
  syncMutes()
})

document.body.addEventListener(
  'pointerdown',
  () => {
    unlock()
  },
  { once: true }
)

// On phones: leave the big header — use a slim play bar so games aren't covered
const gamesSection = document.getElementById('games')
const playBar = document.getElementById('play-bar')
const mutePlay = document.getElementById('mute-play')

function syncMutes() {
  const label = isMuted() ? '🔇' : '🔊'
  muteBtn.textContent = label
  if (mutePlay) mutePlay.textContent = label
}

mutePlay?.addEventListener('click', async () => {
  await unlock()
  setMuted(!isMuted())
  syncMutes()
})

function syncGamesFocus() {
  let visible = location.hash === '#games'
  if (gamesSection && !visible) {
    const r = gamesSection.getBoundingClientRect()
    visible = r.top < 120 && r.bottom > window.innerHeight * 0.35
  }
  document.body.classList.toggle('games-focus', visible)
  if (playBar) playBar.hidden = !visible
  if (visible) closeMenu()
}
window.addEventListener('hashchange', syncGamesFocus)
window.addEventListener('scroll', syncGamesFocus, { passive: true })
syncGamesFocus()

document.getElementById('pet-leo').addEventListener('click', async () => {
  await unlock()
  state.meow = !state.meow
  document.getElementById('meow-bubble').classList.toggle('hidden', !state.meow)
  document.getElementById('leo-bob').className = state.meow ? 'bob' : ''
  document.getElementById('pet-leo').textContent = state.meow ? 'Leo is happy!' : 'Pet Leo'
  if (state.meow) sfx('meow')
})

const FUNNY_STORY = [
  {
    emoji: '📓',
    title: 'Packing time!',
    text: 'Anabia packed her notebook. Leo packed three snacks… and one mysterious sock. “Leo,” said Anabia, “we are going on an adventure, not laundry day.”',
  },
  {
    emoji: '🧦',
    title: 'The sock stays',
    text: 'Leo blinked slowly. The sock stayed in the backpack. Anabia sighed. “Fine. But if the sock causes trouble, I’m blaming you.” Leo looked proud.',
  },
  {
    emoji: '🌞',
    title: 'Sunny path',
    text: 'They followed the sunny path. Leo sniffed every flower. “Important research,” Anabia wrote. (Leo was mostly looking for more snacks.)',
  },
  {
    emoji: '🦋',
    title: 'Butterfly boss',
    text: 'A butterfly landed on Leo’s fluffy head. Leo froze like a statue. Anabia whispered, “Don’t move…” Leo did not move. For five whole seconds. Then he sneezed. The butterfly zoomed away!',
  },
  {
    emoji: '😱',
    title: 'A tiny scream?',
    text: 'Suddenly — “EEEP!” Something jumped behind a bush. Anabia held Leo’s paw. They peeked… and found Anabia’s little sister giggling. “Got you!” said Sissy.',
  },
  {
    emoji: '🎉',
    title: 'The sock’s secret',
    text: 'Sissy pulled the sock from Leo’s bag. Inside was a shiny sticker that said BRAVE EXPLORER. “Surprise!” Leo purred. Anabia laughed so hard she wrote the whole story down. THE END… for now!',
  },
]

let storyPage = 0

function renderFunnyStory() {
  const root = document.getElementById('story-reader')
  if (!root) return
  const page = FUNNY_STORY[storyPage]
  const last = storyPage === FUNNY_STORY.length - 1
  root.innerHTML = `
    <div class="story-card">
      <img src="${LEO_HEAD}" alt="" class="story-leo" width="88" />
      <p class="story-page-num">Page ${storyPage + 1} of ${FUNNY_STORY.length}</p>
      <p class="story-emoji" aria-hidden="true">${page.emoji}</p>
      <h3>${page.title}</h3>
      <p class="story-text">${page.text}</p>
      <div class="story-nav">
        <button type="button" class="btn btn-white btn-sm" id="story-back" ${storyPage === 0 ? 'disabled' : ''}>Back</button>
        <button type="button" class="btn btn-yellow btn-sm" id="story-next">${last ? 'Read again' : 'Next'}</button>
      </div>
      ${last ? `<a class="btn btn-accent btn-sm lift" href="#games" style="margin-top:10px">Play a game with Leo</a>` : ''}
    </div>
  `
  root.querySelector('#story-back')?.addEventListener('click', () => {
    storyPage = Math.max(0, storyPage - 1)
    sfx('whoosh')
    renderFunnyStory()
  })
  root.querySelector('#story-next')?.addEventListener('click', () => {
    if (last) {
      storyPage = 0
      sfx('chime')
    } else {
      storyPage++
      sfx('whoosh')
    }
    renderFunnyStory()
  })
}

renderFunnyStory()

const TABS = [
  ['find', 'Find Leo'],
  ['memory', 'Memory Match'],
  ['catch', 'Catch the Fish'],
  ['dress', 'Dress Up Leo'],
  ['story', 'Story Maker'],
]

function renderTabs() {
  const el = document.getElementById('game-tabs')
  el.innerHTML = TABS.map(
    ([id, label]) => `
    <button type="button" class="tab lift" data-game="${id}" style="background:${state.game === id ? '#1F2A44' : '#fff'};color:${state.game === id ? '#fff' : '#1F2A44'}">${label}</button>`
  ).join('')
  el.querySelectorAll('[data-game]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (state.running) stopCatch()
      state.game = btn.dataset.game
      sfx('tap')
      renderGames()
    })
  })
}

function showPanel(id) {
  document.querySelectorAll('.game-panel').forEach((p) => p.classList.toggle('active', p.dataset.panel === id))
}

function findStatus() {
  const found = state.opened.includes(state.leoSpot)
  if (found) return state.opened.length === 1 ? 'WOW! You found Leo on your first try!' : `Yay! You found Leo in ${state.opened.length} tries!`
  if (state.opened.length > 0) return 'Not there... keep looking!'
  return 'Leo is hiding! Tap a spot to find him.'
}

function renderFind() {
  const root = document.getElementById('panel-find')
  root.innerHTML = `
    <h3>Where is Leo hiding?</h3>
    <p class="status" aria-live="polite">${findStatus()}</p>
    <div class="spots">
      ${SPOT_NAMES.map((label, i) => {
        const open = state.opened.includes(i)
        const showLeo = open && i === state.leoSpot
        const showEmpty = open && i !== state.leoSpot
        return `<button type="button" class="spot lift" data-spot="${i}" style="background:${SPOT_COLORS[i]}" aria-label="Look in the ${label}">
          ${
            !open
              ? `<span class="spot-q">?</span><span class="spot-label">${label}</span>`
              : showLeo
                ? `<img class="bob" src="${LEO_HEAD}" alt="" width="120" /><span style="font-family:'Luckiest Guy',sans-serif;font-size:24px">Found Leo!</span>`
                : `<span style="font-family:'Luckiest Guy',sans-serif;font-size:26px">Not here!</span><span style="font-size:16px;font-weight:700">${label}</span>`
          }
        </button>`
      }).join('')}
    </div>
    <button type="button" class="btn btn-dark lift" id="hide-again">Hide Leo again</button>
  `
  root.querySelectorAll('[data-spot]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.spot)
      if (state.opened.includes(state.leoSpot) || state.opened.includes(i)) return
      state.opened.push(i)
      sfx(i === state.leoSpot ? 'meow' : 'tap')
      if (i === state.leoSpot) sfx('chime')
      renderFind()
    })
  })
  root.querySelector('#hide-again').addEventListener('click', () => {
    state.leoSpot = Math.floor(Math.random() * 6)
    state.opened = []
    sfx('whoosh')
    renderFind()
  })
}

function cardFace(kind) {
  if (kind === 'leo') return `<img class="pop" src="${LEO_HEAD}" alt="" width="104" />`
  if (kind === 'fish')
    return `<svg class="pop" width="84" height="54" viewBox="0 0 80 50"><path d="M58 25 L78 8 L78 42 Z" fill="#FF8C42" stroke="#1F2A44" stroke-width="3" stroke-linejoin="round"/><ellipse cx="34" cy="25" rx="28" ry="18" fill="#FFB067" stroke="#1F2A44" stroke-width="3"/><circle cx="20" cy="21" r="4" fill="#1F2A44"/></svg>`
  if (kind === 'yarn')
    return `<svg class="pop" width="70" height="70" viewBox="0 0 60 60"><circle cx="28" cy="28" r="24" fill="#FF8FA3" stroke="#1F2A44" stroke-width="3"/><path d="M10 18 C 24 24, 34 34, 40 50 M8 32 C 22 34, 34 42, 36 52" stroke="#C2557A" stroke-width="2.5" fill="none"/></svg>`
  if (kind === 'star')
    return `<svg class="pop" width="72" height="72" viewBox="0 0 60 60"><path d="M30 4 L37 22 L56 22 L41 34 L47 54 L30 42 L13 54 L19 34 L4 22 L23 22 Z" fill="#FFD23F" stroke="#1F2A44" stroke-width="3" stroke-linejoin="round"/></svg>`
  if (kind === 'moon')
    return `<svg class="pop" width="70" height="70" viewBox="0 0 60 60"><path d="M36 4 A 26 26 0 1 0 56 40 A 20 20 0 1 1 36 4 Z" fill="#C3B1FF" stroke="#1F2A44" stroke-width="3"/></svg>`
  return `<svg class="pop" width="76" height="64" viewBox="0 0 64 54"><path d="M32 10 C 22 4, 10 4, 4 8 L4 48 C 10 44, 22 44, 32 50 Z" fill="#7FD8BE" stroke="#1F2A44" stroke-width="3"/><path d="M32 10 C 42 4, 54 4, 60 8 L60 48 C 54 44, 42 44, 32 50 Z" fill="#8FD3F4" stroke="#1F2A44" stroke-width="3"/></svg>`
}

function flipCard(i) {
  if (state.lock || state.flipped.includes(i) || state.matched.includes(i)) return
  const flipped = state.flipped.concat([i])
  if (flipped.length < 2) {
    state.flipped = flipped
    sfx('tap')
    renderMemory()
    return
  }
  state.moves++
  if (state.deck[flipped[0]].kind === state.deck[flipped[1]].kind) {
    state.flipped = []
    state.matched = state.matched.concat(flipped)
    sfx('chime')
    renderMemory()
  } else {
    state.flipped = flipped
    state.lock = true
    sfx('whoosh')
    renderMemory()
    flipTimer = setTimeout(() => {
      state.flipped = []
      state.lock = false
      renderMemory()
    }, 900)
  }
}

function renderMemory() {
  const pairs = state.matched.length / 2
  const status =
    pairs === 6
      ? `You matched them all in ${state.moves} moves! Super memory!`
      : `Find the matching pairs!  Moves: ${state.moves}  ·  Pairs: ${pairs} of 6`
  const root = document.getElementById('panel-memory')
  root.innerHTML = `
    <h3>Memory Match</h3>
    <p class="status" aria-live="polite">${status}</p>
    <div class="cards">
      ${state.deck
        .map((c, i) => {
          const up = state.flipped.includes(i) || state.matched.includes(i)
          const done = state.matched.includes(i)
          const bg = done ? '#7FD8BE' : up ? '#FFFFFF' : '#5B3FD6'
          return `<button type="button" class="card" data-card="${i}" style="background:${bg}">${up ? cardFace(c.kind) : '?'}</button>`
        })
        .join('')}
    </div>
    <button type="button" class="btn btn-dark lift" id="new-memory">Shuffle and play again</button>
  `
  root.querySelectorAll('[data-card]').forEach((btn) => btn.addEventListener('click', () => flipCard(Number(btn.dataset.card))))
  root.querySelector('#new-memory').addEventListener('click', () => {
    clearTimeout(flipTimer)
    state.deck = makeDeck()
    state.flipped = []
    state.matched = []
    state.moves = 0
    state.lock = false
    sfx('whoosh')
    renderMemory()
  })
}

function stopCatch() {
  clearInterval(clock)
  clearInterval(mover)
  state.running = false
  state.timeLeft = 0
  state.best = Math.max(state.best, state.score)
  renderCatch()
}

function moveFish() {
  let n
  do {
    n = Math.floor(Math.random() * 9)
  } while (n === state.fishAt)
  state.fishAt = n
  renderCatch()
}

function startCatch() {
  clearInterval(clock)
  clearInterval(mover)
  state.running = true
  state.played = true
  state.score = 0
  state.timeLeft = 20
  state.fishAt = Math.floor(Math.random() * 9)
  clock = setInterval(() => {
    state.timeLeft--
    if (state.timeLeft <= 0) stopCatch()
    else renderCatch()
  }, 1000)
  mover = setInterval(() => moveFish(), 950)
  sfx('chime')
  renderCatch()
}

function renderCatch() {
  let catchStatus = 'Leo is hungry! Tap the fish as fast as you can.'
  if (state.running) catchStatus = 'Quick, tap the fish!'
  else if (state.played) catchStatus = `Time is up! You caught ${state.score} fish for Leo. Yum!`
  const root = document.getElementById('panel-catch')
  root.innerHTML = `
    <h3>Catch Fish for Leo!</h3>
    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px">
      <img src="${LEO_HEAD}" alt="" width="96" />
      <p class="status" aria-live="polite">${catchStatus}</p>
    </div>
    <div class="catch-stats">
      <p class="stat" style="background:#FF8FA3">Time: ${state.timeLeft}</p>
      <p class="stat" style="background:#7FD8BE">Fish: ${state.score}</p>
      <p class="stat" style="background:#C3B1FF">Best: ${state.best}</p>
    </div>
    <div class="holes">
      ${Array.from({ length: 9 }, (_, i) => {
        const has = state.running && state.fishAt === i
        return `<button type="button" class="hole" data-hole="${i}" aria-label="${has ? 'Catch the fish!' : 'Water'}">
          ${
            has
              ? `<svg class="pop" width="90" height="56" viewBox="0 0 80 50"><path d="M58 25 L78 8 L78 42 Z" fill="#FF8C42" stroke="#1F2A44" stroke-width="3"/><ellipse cx="34" cy="25" rx="28" ry="18" fill="#FFB067" stroke="#1F2A44" stroke-width="3"/><circle cx="20" cy="21" r="4" fill="#1F2A44"/></svg>`
              : `<svg width="70" height="24" viewBox="0 0 70 24"><path d="M4 12 C 14 4, 24 20, 35 12 C 46 4, 56 20, 66 12" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`
          }
        </button>`
      }).join('')}
    </div>
    <button type="button" class="btn btn-accent lift" id="start-catch" ${state.running ? 'disabled' : ''}>${state.running ? 'Playing...' : state.played ? 'Play again' : 'Start!'}</button>
  `
  root.querySelectorAll('[data-hole]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.hole)
      if (!state.running || i !== state.fishAt) return
      state.score++
      sfx('chime')
      moveFish()
    })
  })
  root.querySelector('#start-catch').addEventListener('click', () => {
    if (!state.running) startCatch()
  })
}

function accessorySvgs(w) {
  return [
    w.cape
      ? `<svg class="dress-cape pop" viewBox="0 0 120 100" aria-hidden="true"><path d="M20 8 Q60 28 100 8 L108 92 Q60 72 12 92 Z" fill="#D62839" stroke="#1F2A44" stroke-width="3"/><path d="M28 18 Q60 34 92 18" fill="none" stroke="#FF8FA3" stroke-width="4"/></svg>`
      : '',
    w.backpack
      ? `<svg class="dress-backpack pop" viewBox="0 0 70 80" aria-hidden="true"><rect x="10" y="18" width="50" height="52" rx="12" fill="#FFB067" stroke="#1F2A44" stroke-width="3"/><path d="M22 18 V10 H48 V18" fill="none" stroke="#1F2A44" stroke-width="3"/><rect x="22" y="34" width="26" height="18" rx="6" fill="#FFF" stroke="#1F2A44" stroke-width="3"/></svg>`
      : '',
    w.hat
      ? `<svg class="dress-hat pop" viewBox="0 0 80 90" aria-hidden="true"><path d="M40 6 L74 86 L6 86 Z" fill="#FF8FA3" stroke="#1F2A44" stroke-width="3"/><circle cx="40" cy="8" r="9" fill="#FFD23F" stroke="#1F2A44" stroke-width="3"/></svg>`
      : '',
    w.crown
      ? `<svg class="dress-crown pop" viewBox="0 0 96 56" aria-hidden="true"><path d="M6 52 L6 14 L28 32 L48 4 L68 32 L90 14 L90 52 Z" fill="#FFD23F" stroke="#1F2A44" stroke-width="3"/><circle cx="48" cy="38" r="6" fill="#D62839"/><circle cx="18" cy="40" r="4" fill="#8FD3F4"/><circle cx="78" cy="40" r="4" fill="#7FD8BE"/></svg>`
      : '',
    w.explorer
      ? `<svg class="dress-explorer pop" viewBox="0 0 110 50" aria-hidden="true"><ellipse cx="55" cy="38" rx="50" ry="10" fill="#8B5A2B" stroke="#1F2A44" stroke-width="3"/><path d="M20 38 Q55 2 90 38" fill="#C47A3A" stroke="#1F2A44" stroke-width="3"/></svg>`
      : '',
    w.flower
      ? `<svg class="dress-flower pop" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="8" fill="#FFD23F" stroke="#1F2A44" stroke-width="2.5"/><circle cx="18" cy="22" r="9" fill="#FF8FA3" stroke="#1F2A44" stroke-width="2.5"/><circle cx="46" cy="22" r="9" fill="#FF8FA3" stroke="#1F2A44" stroke-width="2.5"/><circle cx="18" cy="42" r="9" fill="#C3B1FF" stroke="#1F2A44" stroke-width="2.5"/><circle cx="46" cy="42" r="9" fill="#8FD3F4" stroke="#1F2A44" stroke-width="2.5"/></svg>`
      : '',
    w.glasses
      ? `<svg class="dress-glasses pop" viewBox="0 0 106 40" aria-hidden="true"><circle cx="29" cy="20" r="17" fill="none" stroke="#1F2A44" stroke-width="5"/><circle cx="77" cy="20" r="17" fill="none" stroke="#1F2A44" stroke-width="5"/><path d="M46 18 Q 53 10 60 18" stroke="#1F2A44" stroke-width="4" fill="none"/><path d="M12 18 H2 M104 18 H94" stroke="#1F2A44" stroke-width="4"/></svg>`
      : '',
    w.shades
      ? `<svg class="dress-shades pop" viewBox="0 0 110 36" aria-hidden="true"><rect x="4" y="8" width="42" height="24" rx="8" fill="#1F2A44"/><rect x="64" y="8" width="42" height="24" rx="8" fill="#1F2A44"/><path d="M46 18 H64" stroke="#1F2A44" stroke-width="4"/><path d="M4 16 H0 M106 16 H110" stroke="#1F2A44" stroke-width="3"/></svg>`
      : '',
    w.mustache
      ? `<svg class="dress-mustache pop" viewBox="0 0 90 28" aria-hidden="true"><path d="M45 8 Q20 4 8 16 Q28 10 45 18 Q62 10 82 16 Q70 4 45 8 Z" fill="#5A3A22" stroke="#1F2A44" stroke-width="2.5"/></svg>`
      : '',
    w.bow
      ? `<svg class="dress-bow pop" viewBox="0 0 76 40" aria-hidden="true"><path d="M38 20 L6 4 L6 36 Z M38 20 L70 4 L70 36 Z" fill="#D62839" stroke="#1F2A44" stroke-width="3"/><circle cx="38" cy="20" r="8" fill="#FF8FA3" stroke="#1F2A44" stroke-width="3"/></svg>`
      : '',
    w.scarf
      ? `<svg class="dress-scarf pop" viewBox="0 0 100 70" aria-hidden="true"><path d="M10 18 Q50 38 90 18" fill="none" stroke="#7FD8BE" stroke-width="14" stroke-linecap="round"/><path d="M10 18 Q50 38 90 18" fill="none" stroke="#1F2A44" stroke-width="3"/><path d="M58 28 L70 62" stroke="#7FD8BE" stroke-width="12" stroke-linecap="round"/><path d="M58 28 L70 62" stroke="#1F2A44" stroke-width="3"/></svg>`
      : '',
    w.badge
      ? `<svg class="dress-badge pop" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="18" fill="#FFD23F" stroke="#1F2A44" stroke-width="3"/><text x="24" y="29" text-anchor="middle" font-size="16" font-weight="900" fill="#1F2A44">L</text></svg>`
      : '',
  ].join('')
}

function wearCount() {
  return Object.values(state.wear).filter(Boolean).length
}

function renderDress() {
  const w = state.wear
  const scene = SCENES[state.scene] || SCENES.sunny
  const root = document.getElementById('panel-dress')
  const groups = [
    {
      title: 'Hats',
      items: [
        ['hat', 'Party hat'],
        ['crown', 'Crown'],
        ['explorer', 'Explorer hat'],
        ['flower', 'Flower'],
      ],
    },
    {
      title: 'Eyes',
      items: [
        ['glasses', 'Glasses'],
        ['shades', 'Sunglasses'],
        ['mustache', 'Mustache'],
      ],
    },
    {
      title: 'Style',
      items: [
        ['bow', 'Bow tie'],
        ['scarf', 'Scarf'],
        ['cape', 'Cape'],
        ['backpack', 'Backpack'],
        ['badge', 'Explorer badge'],
      ],
    },
  ]

  root.innerHTML = `
    <div class="dress-layout">
      <div class="dress-stage" style="background:${scene.bg}">
        <div class="dress-leo">
          <img src="${LEO}" alt="Leo dressed up" />
          ${accessorySvgs(w)}
        </div>
        <p class="dress-look-label">${wearCount() ? `${wearCount()} piece${wearCount() === 1 ? '' : 's'} on` : 'Plain Leo'}</p>
      </div>
      <div class="dress-controls">
        <h3>Dress Up Leo</h3>
        <p class="dress-hint">Mix and match! Pick a scene, then tap accessories on or off. Your look is saved.</p>

        <p class="dress-cat">Scene</p>
        <div class="scene-row">
          ${Object.entries(SCENES)
            .map(
              ([key, s]) =>
                `<button type="button" class="scene-btn lift ${state.scene === key ? 'on' : ''}" data-scene="${key}" style="background:${s.bg}" aria-label="${s.label}" title="${s.label}"></button>`
            )
            .join('')}
        </div>

        ${groups
          .map(
            (g) => `
          <p class="dress-cat">${g.title}</p>
          <div class="outfit-grid">
            ${g.items
              .map(
                ([key, label]) =>
                  `<button type="button" class="wear-btn lift ${w[key] ? 'on' : ''}" data-wear="${key}">${label}</button>`
              )
              .join('')}
          </div>`
          )
          .join('')}

        <div class="dress-actions">
          <button type="button" class="chip-btn" id="random-look">Surprise me!</button>
          <button type="button" class="chip-btn" id="undress">Take it all off</button>
        </div>
      </div>
    </div>
  `

  root.querySelectorAll('[data-wear]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.wear
      if (HEAD_ITEMS.includes(key)) exclusiveToggle(HEAD_ITEMS, key)
      else if (EYE_ITEMS.includes(key)) exclusiveToggle(EYE_ITEMS, key)
      else state.wear[key] = !state.wear[key]
      saveWear()
      sfx('tap')
      renderDress()
    })
  })

  root.querySelectorAll('[data-scene]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.scene = btn.dataset.scene
      saveWear()
      sfx('whoosh')
      renderDress()
    })
  })

  root.querySelector('#undress').addEventListener('click', () => {
    state.wear = { ...WEAR_DEFAULT }
    saveWear()
    sfx('whoosh')
    renderDress()
  })

  root.querySelector('#random-look').addEventListener('click', () => {
    state.wear = { ...WEAR_DEFAULT }
    const head = HEAD_ITEMS[Math.floor(Math.random() * HEAD_ITEMS.length)]
    const eye = EYE_ITEMS[Math.floor(Math.random() * (EYE_ITEMS.length + 1))]
    state.wear[head] = true
    if (eye) state.wear[eye] = true
    ;['bow', 'scarf', 'cape', 'backpack', 'badge', 'mustache'].forEach((k) => {
      state.wear[k] = Math.random() > 0.55
    })
    const scenes = Object.keys(SCENES)
    state.scene = scenes[Math.floor(Math.random() * scenes.length)]
    saveWear()
    sfx('chime')
    renderDress()
  })
}

function renderStory() {
  const story = `One sunny day, ${WHO[state.who]} went to ${WHERE[state.where]} and ${WHAT[state.what]}! Everyone cheered. THE END.`
  const mk = (list, key) =>
    list
      .map(
        (label, i) =>
          `<button type="button" class="chip-btn ${state[key] === i ? 'on' : ''}" data-story="${key}" data-i="${i}">${label}</button>`
      )
      .join('')
  const root = document.getElementById('panel-story')
  root.innerHTML = `
    <h3>Story Maker</h3>
    <p style="margin:0;font-size:19px;font-weight:700;text-align:center">Be an author like me! Pick one from each row to make a silly story.</p>
    <div style="display:flex;flex-direction:column;gap:10px;width:100%">
      <p style="margin:0;font-weight:900;font-size:18px">1. Who?</p>
      <div class="story-row">${mk(WHO, 'who')}</div>
      <p style="margin:8px 0 0;font-weight:900;font-size:18px">2. Where?</p>
      <div class="story-row">${mk(WHERE, 'where')}</div>
      <p style="margin:8px 0 0;font-weight:900;font-size:18px">3. What happened?</p>
      <div class="story-row">${mk(WHAT, 'what')}</div>
    </div>
    <div class="story-box">
      <img src="${LEO_HEAD}" alt="" width="90" />
      <p aria-live="polite">${story}</p>
    </div>
    <button type="button" class="btn btn-accent lift" id="surprise">Surprise me!</button>
  `
  root.querySelectorAll('[data-story]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state[btn.dataset.story] = Number(btn.dataset.i)
      sfx('tap')
      renderStory()
    })
  })
  root.querySelector('#surprise').addEventListener('click', () => {
    state.who = Math.floor(Math.random() * 5)
    state.where = Math.floor(Math.random() * 5)
    state.what = Math.floor(Math.random() * 5)
    sfx('chime')
    renderStory()
  })
}

function renderGames() {
  renderTabs()
  showPanel(state.game)
  if (state.game === 'find') renderFind()
  if (state.game === 'memory') renderMemory()
  if (state.game === 'catch') renderCatch()
  if (state.game === 'dress') renderDress()
  if (state.game === 'story') renderStory()
}

renderGames()

# Anabia Noor Adventure Website — Design Spec

**Date:** 2026-11-03  
**Status:** Approved for planning (pending user review of this doc)

## Goal

A fun, interactive website for **Anabia Noor** (first storybook author, more books later). Aimed at **7–8 year olds**: sunny outdoor adventure world, signature character **Leo**, soft music, and light play. Adults can share one URL; kids can tap and explore.

## Brand & world

- **Hero name:** Anabia Noor (dominant on first view — not buried in nav)
- **Tagline:** “Anabia writes. Leo explores.”
- **Mood:** Bright outdoor adventure — sky blue, grass green, sunny yellow; warm Leo-brown as accent
- **Avoid:** Generic purple gradients, cream/terracotta “AI default,” dark neon glow looks
- **Recurring character:** Leo appears on the site and is meant to be written into her books so kids recognize him

## Leo (signature character)

- **Who:** Male brown / beige fluffy **Persian** cat, explorer personality
- **Look:** Soft picture-book vector style (reference: fluffy Persian sitting pose provided by family). Original art only — do not ship watermarked stock (e.g. VectorStock) as the production asset
- **Costume:** Tiny explorer backpack or scarf so he reads as “adventure Leo”
- **Motion level (B — playful):**
  - Always a little alive (blink / breathe)
  - Walks the map path, peeks from corners, reacts often
  - Bigger reactions on tap, trail steps, and game wins
- **Sound:** Soft meow / “let’s go” on tap; happy chimes on wins; never jumpscare-loud
- **Tech for motion (v1):** Illustrated Leo + CSS / lightweight animation (e.g. Lottie or sprite-like states). Not a 3D game engine

## Site structure — Adventure Map (Approach A)

Single-page hub that feels like a game map: a **winding sunny trail** with five stops. Leo lives on/around the path.

| Stop | Purpose |
|------|---------|
| **1. Meet** | Anabia intro + photos in fun sticker / polaroid / doodle frames (not a raw Instagram feed) |
| **2. Leo** | Big Leo portrait, name, short kid-friendly facts she can echo in books |
| **3. Trail** | Short teaser story (4–6 tap screens) with Leo — not the full published book |
| **4. Play** | Two tiny games (e.g. Find Leo; Pack the backpack drag/drop) |
| **5. Books** | Shelf: Book 1 featured + empty “coming soon” slots for later books |

Hotspots open overlays or scroll-locked panels so kids stay “in the world.”

## Photos (provided)

Use family photos in fun frames on Meet (and optionally Books / about):

- `assets/anabia/anabia-adventure.jpg` — outdoor adventure / Land Cruiser pose
- `assets/anabia/anabia-pink.jpg` — pink overalls, cute pose  
Style reference for Leo (inspiration only, not production art): `assets/anabia/leo-style-reference.png`

More photos can be added later; Instagram ([anabicious](https://www.instagram.com/anabicious/)) is inspiration/source for the family, not scraped automatically.

## Audio

- Soft looping **adventure music** on the map
- SFX: Leo tap, stop unlock, trail page-turn whoosh, game win
- **Always-visible mute / unmute** control (parent-friendly; remember preference in `localStorage`)
- Autoplay policies: start muted or wait for first tap if the browser blocks audio; then unlock music

## Multi-book future

- Books shelf is a first-class stop from day one
- Adding Book 2+ = new shelf entry + optional trail/game content later — **no full redesign**
- Leo stays visually consistent across books and site

## Technical approach (v1)

- **Stack:** Vite + React (or Vite + vanilla if simpler at plan time) — static deployable site
- **Responsive:** Phone-first taps (large hit targets); desktop gets the full map
- **Assets:** SVG/PNG Leo states or Lottie; Web Audio / `<audio>` for music/SFX
- **No backend required** for v1 (static hosting: e.g. Netlify, Vercel, GitHub Pages)
- **Accessibility basics:** Mute control labeled; reduced-motion respect where reasonable; alt text on photos

## Out of scope (v1)

- Full ebook reader / paid checkout
- User accounts, comments, live chat
- Scraping Instagram
- Heavy 3D / Unity-style game engine
- Shipping third-party watermarked stock as Leo

## Success criteria

- A 7–8 year old can find Leo, tap the trail, and play a game without help
- Anabia’s name and face are unmistakable on first view
- Leo is memorable enough to name-check in the book
- Parent can mute sound in one tap
- Book shelf clearly ready for more titles

## Open items for implementation plan

- Final Book 1 title and cover (placeholder OK until provided)
- Exact Leo costume (backpack vs scarf) — default backpack
- Hosting target and custom domain (if any)
- Commission vs AI-assisted vs hand-drawn pipeline for final Leo art (must be original / licensed)

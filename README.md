# snake# 🐍 SNAKE — Neon Terminal

> Classic Snake game built with **vanilla JS + HTML5 Canvas**, styled with a neon terminal / CRT aesthetic. Zero dependencies. Zero frameworks.

![snake-preview](https://via.placeholder.com/800x400/060608/00ffb2?text=SNAKE+NEON+TERMINAL)

---

## ✨ Features

- **Smooth canvas rendering** with glow effects and animated food
- **Neon CRT aesthetic** — scanlines, phosphor glow, corner decorations
- **Level progression** — speed increases every 5 points
- **High score** persisted in `localStorage`
- **Keyboard + Swipe** support (mobile-friendly)
- **PWA-ready** — installable on mobile (`manifest.json`)
- **No dependencies** — pure HTML / CSS / JS

---

## 🎮 Controls

| Input | Action |
|-------|--------|
| `↑ ↓ ← →` | Move snake |
| `W A S D` | Move snake |
| `SPACE` / `ENTER` | Start / Retry |
| `P` | Pause / Resume |
| Swipe | Move (mobile) |
| Tap | Start / Pause (mobile) |

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/snake-game.git

# Open directly in browser — no build step needed
open snake-game/index.html
```

Or serve locally:

```bash
cd snake-game
npx serve .
# → http://localhost:3000
```

---

## 📂 Project Structure

```
snake-game/
├── index.html      # Entry point + layout
├── style.css       # Neon terminal styling + animations
├── game.js         # Game engine (canvas, input, state)
├── manifest.json   # PWA manifest
└── README.md
```

---

## 🧠 How It Works

| Concept | Implementation |
|---------|---------------|
| Grid system | `canvas / GRID (20px cells)` |
| Game loop | `setInterval` with dynamic speed |
| Food animation | `requestAnimationFrame` radial gradient pulse |
| Collision | Wall + self-intersection check per tick |
| Level speed | `max(60ms, 130ms - (level-1) * 8ms)` |
| Score persistence | `localStorage` |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#060608` |
| Neon green | `#00ffb2` |
| Accent red | `#ff3c78` |
| Display font | Teko (Google Fonts) |
| Mono font | Share Tech Mono |

---

## 📜 License

MIT — free to use, remix, and deploy.

---

*Built with ❤️ and vanilla JS.*
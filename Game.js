// ─────────────────────────────────────────
//  SNAKE GAME — core engine
// ─────────────────────────────────────────

const GRID = 20;
const TICK_BASE = 130;

const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const msgEl   = document.getElementById('overlayMsg');
const subEl   = document.getElementById('overlaySub');
const scoreEl = document.getElementById('scoreVal');
const hiEl    = document.getElementById('hiVal');
const lvlEl   = document.getElementById('lvlVal');

let snake, dir, nextDir, food, score, hiScore, level, loop, running, paused;

hiScore = parseInt(localStorage.getItem('snakeHi') || '0');
hiEl.textContent = hiScore;

// ── canvas sizing ──────────────────────────
function resize() {
  const size = Math.min(
    window.innerWidth  * 0.9,
    window.innerHeight * 0.72,
    480
  );
  const cells = Math.floor(size / GRID) * GRID;
  canvas.width  = cells;
  canvas.height = cells;
}
resize();
window.addEventListener('resize', () => { resize(); if (!running) draw(); });

// ── helpers ────────────────────────────────
const cols = () => canvas.width  / GRID;
const rows = () => canvas.height / GRID;
const rand = (n) => Math.floor(Math.random() * n);

function spawnFood() {
  let pos;
  do {
    pos = { x: rand(cols()), y: rand(rows()) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

// ── init ───────────────────────────────────
function init() {
  const cx = Math.floor(cols() / 2);
  const cy = Math.floor(rows() / 2);
  snake   = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
  dir     = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score   = 0;
  level   = 1;
  scoreEl.textContent = 0;
  lvlEl.textContent   = 1;
  spawnFood();
}

// ── game tick ──────────────────────────────
function tick() {
  dir = { ...nextDir };
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // wall collision
  if (head.x < 0 || head.x >= cols() || head.y < 0 || head.y >= rows()) {
    return gameOver();
  }
  // self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    return gameOver();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    if (score > hiScore) {
      hiScore = score;
      hiEl.textContent = hiScore;
      localStorage.setItem('snakeHi', hiScore);
    }
    level = Math.floor(score / 5) + 1;
    lvlEl.textContent = level;
    spawnFood();
    // pulse effect
    canvas.classList.add('pulse');
    setTimeout(() => canvas.classList.remove('pulse'), 120);
  } else {
    snake.pop();
  }

  draw();
}

// ── draw ───────────────────────────────────
function draw() {
  const W = canvas.width;
  const H = canvas.height;

  // Background
  ctx.fillStyle = '#060608';
  ctx.fillRect(0, 0, W, H);

  // Grid dots
  ctx.fillStyle = 'rgba(0,255,180,0.06)';
  for (let x = 0; x < cols(); x++) {
    for (let y = 0; y < rows(); y++) {
      ctx.fillRect(x * GRID + GRID / 2 - 1, y * GRID + GRID / 2 - 1, 2, 2);
    }
  }

  // Food — glowing orb
  const fx = food.x * GRID + GRID / 2;
  const fy = food.y * GRID + GRID / 2;
  const t  = Date.now() / 400;
  const pulse = 3 + Math.sin(t) * 1.5;

  const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, pulse * 2.5);
  grad.addColorStop(0,   'rgba(255,60,120,1)');
  grad.addColorStop(0.5, 'rgba(255,20,80,0.6)');
  grad.addColorStop(1,   'rgba(255,0,60,0)');
  ctx.beginPath();
  ctx.arc(fx, fy, pulse * 2.5, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(fx, fy, pulse, 0, Math.PI * 2);
  ctx.fillStyle = '#ff3c78';
  ctx.shadowColor = '#ff3c78';
  ctx.shadowBlur  = 14;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Snake
  snake.forEach((seg, i) => {
    const progress = 1 - (i / snake.length) * 0.75;
    const x = seg.x * GRID;
    const y = seg.y * GRID;
    const pad = 2;
    const size = GRID - pad * 2;
    const radius = i === 0 ? 5 : 3;

    // glow on head
    if (i === 0) {
      ctx.shadowColor = '#00ffb2';
      ctx.shadowBlur  = 18;
    }

    const alpha = Math.floor(progress * 255).toString(16).padStart(2, '0');
    ctx.fillStyle = i === 0 ? '#00ffb2' : `#00d496${alpha}`;
    roundRect(ctx, x + pad, y + pad, size, size, radius);
    ctx.fill();
    ctx.shadowBlur = 0;

    // inner highlight on head
    if (i === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      roundRect(ctx, x + pad + 3, y + pad + 3, size / 3, size / 3, 2);
      ctx.fill();
    }
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── food animation loop ────────────────────
let animFrame;
function foodAnim() {
  if (!running || paused) return;
  draw();
  animFrame = requestAnimationFrame(foodAnim);
}

// ── game state ─────────────────────────────
function startGame() {
  clearInterval(loop);
  cancelAnimationFrame(animFrame);
  init();
  running = true;
  paused  = false;
  overlay.classList.add('hidden');
  const speed = () => Math.max(60, TICK_BASE - (level - 1) * 8);
  loop = setInterval(() => {
    tick();
    clearInterval(loop);
    loop = setInterval(arguments.callee, speed());
  }, speed());
  foodAnim();
}

function gameOver() {
  clearInterval(loop);
  cancelAnimationFrame(animFrame);
  running = false;
  draw();
  setTimeout(() => {
    msgEl.textContent = 'GAME OVER';
    subEl.textContent = `Score: ${score} — Press SPACE or tap to retry`;
    overlay.classList.remove('hidden');
  }, 200);
}

function pauseGame() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    clearInterval(loop);
    cancelAnimationFrame(animFrame);
    msgEl.textContent = 'PAUSED';
    subEl.textContent = 'Press P or tap to continue';
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
    const speed = Math.max(60, TICK_BASE - (level - 1) * 8);
    loop = setInterval(tick, speed);
    foodAnim();
  }
}

// ── input ──────────────────────────────────
const DIR_MAP = {
  ArrowUp:    { x: 0,  y: -1 },
  ArrowDown:  { x: 0,  y:  1 },
  ArrowLeft:  { x: -1, y:  0 },
  ArrowRight: { x: 1,  y:  0 },
  w: { x: 0,  y: -1 },
  s: { x: 0,  y:  1 },
  a: { x: -1, y:  0 },
  d: { x: 1,  y:  0 },
};

document.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') {
    if (!running || !overlay.classList.contains('hidden')) return startGame();
  }
  if (e.key === 'p' || e.key === 'P') return pauseGame();

  const d = DIR_MAP[e.key];
  if (d && !(d.x === -dir.x && d.y === 0) && !(d.y === -dir.y && d.x === 0)) {
    nextDir = d;
    e.preventDefault();
  }
});

// ── touch / swipe ──────────────────────────
let touchStart = null;
canvas.addEventListener('touchstart', e => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });

canvas.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax < 10 && ay < 10) {
    if (!running || !overlay.classList.contains('hidden')) return startGame();
    return pauseGame();
  }
  let d;
  if (ax > ay) d = dx > 0 ? DIR_MAP.ArrowRight : DIR_MAP.ArrowLeft;
  else         d = dy > 0 ? DIR_MAP.ArrowDown  : DIR_MAP.ArrowUp;
  if (!(d.x === -dir.x && d.y === 0) && !(d.y === -dir.y && d.x === 0)) {
    nextDir = d;
  }
  touchStart = null;
}, { passive: true });

overlay.addEventListener('click', () => {
  if (!running) return startGame();
  pauseGame();
});

// ── initial draw ───────────────────────────
(function bootstrap() {
  resize();
  init();
  draw();
  msgEl.textContent = 'SNAKE';
  subEl.textContent = 'Press SPACE or tap to start';
  overlay.classList.remove('hidden');
})();
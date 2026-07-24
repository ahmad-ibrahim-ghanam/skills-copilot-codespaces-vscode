const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusLabel = document.getElementById("status");

const gravity = 0.55;
const keys = { left: false, right: false };

const player = {
  x: 60,
  y: 340,
  w: 28,
  h: 38,
  vx: 0,
  vy: 0,
  speed: 3.8,
  jump: -11.5,
  onGround: false,
};

const floorY = 390;
const platforms = [
  { x: 150, y: 330, w: 120, h: 14 },
  { x: 330, y: 280, w: 120, h: 14 },
  { x: 520, y: 240, w: 110, h: 14 },
  { x: 700, y: 300, w: 120, h: 14 },
];

const enemies = [
  { x: 260, y: 370, w: 28, h: 20, dir: 1, min: 220, max: 320, speed: 1.1 },
  { x: 570, y: 220, w: 28, h: 20, dir: -1, min: 530, max: 620, speed: 1.4 },
];

const coins = [
  { x: 200, y: 300, r: 8, taken: false },
  { x: 390, y: 250, r: 8, taken: false },
  { x: 560, y: 210, r: 8, taken: false },
  { x: 750, y: 270, r: 8, taken: false },
];

let gameOver = false;
let won = false;

function reset() {
  player.x = 60;
  player.y = 340;
  player.vx = 0;
  player.vy = 0;
  gameOver = false;
  won = false;
  for (const coin of coins) coin.taken = false;
  statusLabel.textContent = "Collect all coins.";
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function updatePlayer() {
  player.vx = 0;
  if (keys.left) player.vx = -player.speed;
  if (keys.right) player.vx = player.speed;

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;
  player.onGround = false;

  if (player.y + player.h >= floorY) {
    player.y = floorY - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  for (const p of platforms) {
    const fallingOnTop =
      player.vy >= 0 &&
      player.y + player.h >= p.y &&
      player.y + player.h <= p.y + player.vy + 8 &&
      player.x + player.w > p.x &&
      player.x < p.x + p.w;
    if (fallingOnTop) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
}

function updateEnemies() {
  for (const enemy of enemies) {
    enemy.x += enemy.speed * enemy.dir;
    if (enemy.x < enemy.min || enemy.x + enemy.w > enemy.max) enemy.dir *= -1;
    if (rectsOverlap(player, enemy)) {
      gameOver = true;
      statusLabel.textContent = "You got hit. Press R to restart.";
    }
  }
}

function updateCoins() {
  for (const coin of coins) {
    if (coin.taken) continue;
    const hit =
      player.x < coin.x + coin.r &&
      player.x + player.w > coin.x - coin.r &&
      player.y < coin.y + coin.r &&
      player.y + player.h > coin.y - coin.r;
    if (hit) coin.taken = true;
  }
  const left = coins.filter((c) => !c.taken).length;
  if (left === 0 && !won) {
    won = true;
    statusLabel.textContent = "You win! Press R to play again.";
  } else if (!gameOver && !won) {
    statusLabel.textContent = `Collect all coins. ${left} left.`;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#5ea84f";
  ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);

  ctx.fillStyle = "#8b5a2b";
  for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);

  ctx.fillStyle = "#f6d94f";
  for (const c of coins) {
    if (c.taken) continue;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#8b4513";
  for (const e of enemies) ctx.fillRect(e.x, e.y, e.w, e.h);

  ctx.fillStyle = "#e53935";
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = "#0d47a1";
  ctx.fillRect(player.x + 3, player.y + player.h - 12, player.w - 6, 12);
}

function loop() {
  if (!gameOver && !won) {
    updatePlayer();
    updateEnemies();
    updateCoins();
  }
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") keys.left = true;
  if (event.key === "ArrowRight") keys.right = true;
  if (event.code === "Space" && player.onGround && !gameOver && !won) player.vy = player.jump;
  if (event.key.toLowerCase() === "r") reset();
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") keys.left = false;
  if (event.key === "ArrowRight") keys.right = false;
});

reset();
loop();

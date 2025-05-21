const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const gameSpeed = 10; // Slower speed (higher = slower)
const smoothSteps = 9; // Smooth movement steps

// Game state
let snake = [{ x: 15, y: 15, dx: 1, dy: 0 }];
let nextDirection = { x: 1, y: 0 };
let food = randomFood();
let gameOver = false;
let score = 0;
let movementStep = 0;
let smoothSnake = [...snake];

function gameLoop() {
  if (gameOver) {
    drawGameOver();
    return;
  }

  update();
  draw();
  setTimeout(() => requestAnimationFrame(gameLoop), gameSpeed);
}

function update() {
  movementStep++;
  
  if (movementStep >= smoothSteps) {
    movementStep = 0;
    
    // Update direction
    snake[0].dx = nextDirection.x;
    snake[0].dy = nextDirection.y;
    
    // Create new head
    const head = {
      x: snake[0].x + snake[0].dx,
      y: snake[0].y + snake[0].dy,
      dx: snake[0].dx,
      dy: snake[0].dy
    };

    // Wrap around
    if (head.x < 0) head.x = tileCount - 1;
    else if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    else if (head.y >= tileCount) head.y = 0;

    // Check collision
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        return endGame();
      }
    }

    snake.unshift(head);
    
    // Check food
    if (head.x === food.x && head.y === food.y) {
      score++;
      food = randomFood();
    } else {
      snake.pop();
    }
  }
  
  // Calculate smooth positions
  smoothSnake = snake.map((segment, index) => {
    if (index === 0) {
      const progress = movementStep / smoothSteps;
      return {
        x: segment.x - segment.dx + (segment.dx * progress),
        y: segment.y - segment.dy + (segment.dy * progress),
        dx: segment.dx,
        dy: segment.dy
      };
    }
    return {...segment};
  });
}

function draw() {
  // Background
  ctx.fillStyle = "#34495e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw snake
  smoothSnake.forEach((segment, index) => {
    const isHead = index === 0;
    const size = gridSize * (isHead ? 1.1 : 0.9);
    const x = segment.x * gridSize;
    const y = segment.y * gridSize;
    
    ctx.fillStyle = isHead ? "#2ecc71" : "#27ae60";
    ctx.beginPath();
    ctx.roundRect(
      x + (gridSize - size)/2, 
      y + (gridSize - size)/2, 
      size, size, 
      [size/2]
    );
    ctx.fill();
  });
  
  // Draw food
  ctx.fillStyle = "#e74c3c";
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize/2,
    food.y * gridSize + gridSize/2,
    gridSize/2,
    0, Math.PI * 2
  );
  ctx.fill();
  
  // Draw score
  ctx.fillStyle = "#ecf0f1";
  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, 20, 30);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", canvas.width/2, canvas.height/2 - 40);
  ctx.font = "36px Arial";
  ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
  ctx.font = "24px Arial";
  ctx.fillText("Press SPACE to restart", canvas.width/2, canvas.height/2 + 80);
}

function randomFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
  return newFood;
}

function endGame() {
  gameOver = true;
}

function setDirection(newDir) {
  if (newDir === "left" && snake[0].dx !== 1) nextDirection = { x: -1, y: 0 };
  else if (newDir === "right" && snake[0].dx !== -1) nextDirection = { x: 1, y: 0 };
  else if (newDir === "up" && snake[0].dy !== 1) nextDirection = { x: 0, y: -1 };
  else if (newDir === "down" && snake[0].dy !== -1) nextDirection = { x: 0, y: 1 };
}

// Controls
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && gameOver) resetGame();
  else if (e.key === 'ArrowLeft') setDirection("left");
  else if (e.key === 'ArrowRight') setDirection("right");
  else if (e.key === 'ArrowUp') setDirection("up");
  else if (e.key === 'ArrowDown') setDirection("down");
});

function resetGame() {
  snake = [{ x: 15, y: 15, dx: 1, dy: 0 }];
  nextDirection = { x: 1, y: 0 };
  food = randomFood();
  gameOver = false;
  score = 0;
  movementStep = 0;
  smoothSnake = [...snake];
  requestAnimationFrame(gameLoop);
}

resetGame();
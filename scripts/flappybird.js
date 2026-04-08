const flappyBird = (p) => {
  // files
  let base, gameOver, pipe, bird, bg;

  // settings
  let gravity = 0.3;
  let jumpPower = 6;
  let scrollSpeed = 3;
  let pipeWidth = 80;
  let playerSize = 35;
  let pipeGap = 160;
  let pipeSpacing = 300;

  // game state
  let playerY, playerVel;
  let pipes = [];
  let score = 0;
  let FBGAMESTATE = 'start'; // 'start', 'playing', 'dead'
  let bgX = 0;
  let baseX = 0;

  p.preload = function() {
    base = p.loadImage("assets/base.png");
    gameOver = p.loadImage("assets/gameover.png");
    pipe = p.loadImage("assets/pipe-green.png");
    bg = p.loadImage("assets/background-day.png");
    bird = p.loadImage("assets/yellowbird-midflap.png");
  }

  p.setup = function() {
    const cnv = p.createCanvas(1000, 800);
    cnv.elt.id = "fbCanvas";
    document.getElementById("gameDiv").appendChild(cnv.elt);
    cnv.elt.classList.add("minigameCanvas");
    p.frameRate(120);
    resetGame();
  }

  p.draw = function() {
    // Draw scrolling background
    p.image(bg, bgX, 0, 1000, 800);
    p.image(bg, bgX + 1000, 0, 1000, 800);
    let dtScale = p.deltaTime * (60 / 1000);

    if (FBGAMESTATE === 'playing') {
      bgX -= scrollSpeed * 0.5 * dtScale;
      if (bgX <= -1000) bgX = 0;
    }
    
    // Update and draw pipes
    if (FBGAMESTATE === 'playing') {
      // Add new pipes
      if (pipes.length === 0 || pipes[pipes.length - 1].x < p.width - pipeSpacing) {
        let pipeY = p.random(150, p.height - 500);
        pipes.push({ x: p.width, y: pipeY, passed: false });
      }
      
      // Update pipes
      for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= scrollSpeed * dtScale;
        
        // Remove off-screen pipes
        if (pipes[i].x < -pipeWidth) {
          pipes.splice(i, 1);
        }
      }
      
      // Update player
      playerVel += gravity * dtScale;
      playerY += playerVel * dtScale;
      
      // Check collisions
      checkCollisions();
    }
    
    // Draw pipes
    for (let pipeVar of pipes) {
      // Top pipe
      p.push();
      p.translate(pipeVar.x + pipeWidth / 2, pipeVar.y);
      p.scale(1, -1);
      p.image(pipe, -pipeWidth / 2, 0, pipeWidth, 400);
      p.pop();
      
      // Bottom pipe
      p.image(pipe, pipeVar.x, pipeVar.y + pipeGap, pipeWidth, 400);
      
      // Score when passing pipe
      if (FBGAMESTATE === 'playing' && !pipeVar.passed && pipeVar.x + pipeWidth < p.width / 2 - playerSize / 2) {
        pipeVar.passed = true;
        score++;
        scrollSpeed = score > 40 ? 6 : 3 + (score * 0.075);
        pipeGap = score > 40 ? 120 : 160 - (score);
      }
    }
    
    // Draw scrolling base
    p.image(base, baseX, p.height - 150, 1000, 150);
    p.image(base, baseX + 1000, p.height - 150, 1000, 150);
    
    if (FBGAMESTATE === 'playing') {
      baseX -= scrollSpeed * dtScale;
      if (baseX <= -1000) baseX = 0;
    }
    
    // Draw player
    p.push();
    p.translate(p.width / 2, playerY);
    let angle = p.map(playerVel, -jumpPower, 10, -20, 40);
    angle = p.constrain(angle, -20, 50);
    p.rotate(p.radians(angle));
    p.image(bird, -playerSize / 2, -playerSize / 2, playerSize * 1.3, playerSize * 1.1);
    p.pop();
    
    // Draw score
    p.fill(255);
    p.textAlign(p.CENTER);
    p.textSize(48);
    p.text(score, p.width / 2, 60);
    
    // Draw start/game over screen
    if (FBGAMESTATE === 'start') {
      p.fill(255);
      p.textSize(24);
      p.text('Click to Start', p.width / 2, p.height / 2);
    } else if (FBGAMESTATE === 'dead') {
      p.image(gameOver, p.width / 2 - 100, p.height / 2 - 100, 200, 50);
      p.fill(255);
      p.textSize(20);
      p.text('Click to Restart', p.width / 2, p.height / 2 + 20);
    }
  }

  p.mousePressed = function() {
    if (FBGAMESTATE === 'start') {
      FBGAMESTATE = 'playing';
    } else if (FBGAMESTATE === 'playing') {
      playerVel = -jumpPower;
    } else if (FBGAMESTATE === 'dead') {
      resetGame();
      FBGAMESTATE = 'playing';
    }
  }

  p.keyPressed = function() {
    if (p.key === ' ' || p.key == "ArrowUp") {
      p.mousePressed();
    }
    if (p.key == "f") {
      p.fullscreen(!p.fullscreen());
    }
  }

  function checkCollisions() {
    // Hit ground or ceiling
    if (playerY + playerSize / 2 > p.height - 150 || playerY - playerSize / 2 < 0) {
      FBGAMESTATE = 'dead';
      return;
    }
    
    // Hit pipes
    let playerLeft = p.width / 2 - playerSize / 2;
    let playerRight = p.width / 2 + playerSize / 2;
    let playerTop = playerY - playerSize / 2;
    let playerBottom = playerY + playerSize / 2;
    
    for (let p of pipes) {
      if (playerRight > p.x && playerLeft < p.x + pipeWidth) {
        if (playerTop < p.y || playerBottom > p.y + pipeGap) {
          FBGAMESTATE = 'dead';
          return;
        }
      }
    }
  }

  function resetGame() {
    // drywall clicker integration
    player.minigames.flappyBird.best = score > player.minigames.flappyBird.best ? score : player.minigames.flappyBird.best;

    playerY = p.height / 2;
    playerVel = 0;
    pipes = [];
    score = 0;
    bgX = 0;
    baseX = 0;
    pipeGap = 160;
    scrollSpeed = 3;
    FBGAMESTATE = 'start';
  }
}
let flappyBirdInstance = new p5(flappyBird);
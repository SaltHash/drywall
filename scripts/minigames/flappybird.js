/**
 * Flappy Bird minigame (p5.js instance mode ES module).
 *
 * The p5 instance is created by `initFlappyBird()`, which should be
 * called from main.js after the DOM is ready.
 */

import { gameState } from "../core/state.js";

/**
 * Creates and returns a new p5 instance for the Flappy Bird minigame.
 * @returns {p5} The p5 instance
 */
export function initFlappyBird() {
  const sketch = (p) => {
    // files
    let base, gameOver, pipe, birdImg, bg;

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
    let fbGameState = "start"; // 'start', 'playing', 'dead'
    let bgX = 0;
    let baseX = 0;

    p.preload = function () {
      base = p.loadImage("assets/minigames/base.png");
      gameOver = p.loadImage("assets/minigames/gameover.png");
      pipe = p.loadImage("assets/minigames/pipe-green.png");
      bg = p.loadImage("assets/minigames/background-day.png");
      birdImg = p.loadImage("assets/minigames/yellowbird-midflap.png");
    };

    p.setup = function () {
      const cnv = p.createCanvas(1000, 800);
      cnv.elt.id = "fbCanvas";
      document.getElementById("gameDiv").appendChild(cnv.elt);
      cnv.elt.classList.add("minigameCanvas");
      p.frameRate(120);
      resetGame();
    };

    p.draw = function () {
      // Draw scrolling background
      p.image(bg, bgX, 0, 1000, 800);
      p.image(bg, bgX + 1000, 0, 1000, 800);
      let dtScale = p.deltaTime * (60 / 1000);

      if (fbGameState === "playing") {
        bgX -= scrollSpeed * 0.5 * dtScale;
        if (bgX <= -1000) bgX = 0;
      }

      // Update and draw pipes
      if (fbGameState === "playing") {
        // Add new pipes
        if (
          pipes.length === 0 ||
          pipes[pipes.length - 1].x < p.width - pipeSpacing
        ) {
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
        p.image(
          pipe,
          pipeVar.x,
          pipeVar.y + pipeGap,
          pipeWidth,
          400,
        );

        // Score when passing pipe
        if (
          fbGameState === "playing" &&
          !pipeVar.passed &&
          pipeVar.x + pipeWidth < p.width / 2 - playerSize / 2
        ) {
          pipeVar.passed = true;
          score++;
          scrollSpeed = score > 40 ? 6 : 3 + score * 0.075;
          pipeGap = score > 40 ? 120 : 160 - score;
        }
      }

      // Draw scrolling base
      p.image(base, baseX, p.height - 150, 1000, 150);
      p.image(base, baseX + 1000, p.height - 150, 1000, 150);

      if (fbGameState === "playing") {
        baseX -= scrollSpeed * dtScale;
        if (baseX <= -1000) baseX = 0;
      }

      // Draw player
      p.push();
      p.translate(p.width / 2, playerY);
      let angle = p.map(playerVel, -jumpPower, 10, -20, 40);
      angle = p.constrain(angle, -20, 50);
      p.rotate(p.radians(angle));
      p.image(
        birdImg,
        -playerSize / 2,
        -playerSize / 2,
        playerSize * 1.3,
        playerSize * 1.1,
      );
      p.pop();

      // Draw score
      p.fill(255);
      p.textAlign(p.CENTER);
      p.textSize(48);
      p.text(score, p.width / 2, 60);

      // Draw start/game over screen
      if (fbGameState === "start") {
        p.fill(255);
        p.textSize(24);
        p.text("Click to Start", p.width / 2, p.height / 2);
      } else if (fbGameState === "dead") {
        p.image(
          gameOver,
          p.width / 2 - 100,
          p.height / 2 - 100,
          200,
          50,
        );
        p.fill(255);
        p.textSize(20);
        p.text("Click to Restart", p.width / 2, p.height / 2 + 20);
      }
    };

    p.mousePressed = function () {
      if (fbGameState === "start") {
        fbGameState = "playing";
      } else if (fbGameState === "playing") {
        playerVel = -jumpPower;
      } else if (fbGameState === "dead") {
        resetGame();
        fbGameState = "playing";
      }
    };

    p.keyPressed = function () {
      if (p.key === " " || p.key == "ArrowUp") {
        p.mousePressed();
      }
      if (p.key == "f") {
        p.fullscreen(!p.fullscreen());
      }
    };

    function checkCollisions() {
      // Hit ground or ceiling
      if (
        playerY + playerSize / 2 > p.height - 150 ||
        playerY - playerSize / 2 < 0
      ) {
        fbGameState = "dead";
        return;
      }

      // Hit pipes
      let playerLeft = p.width / 2 - playerSize / 2;
      let playerRight = p.width / 2 + playerSize / 2;
      let playerTop = playerY - playerSize / 2;
      let playerBottom = playerY + playerSize / 2;

      for (let pipeObj of pipes) {
        if (playerRight > pipeObj.x && playerLeft < pipeObj.x + pipeWidth) {
          if (playerTop < pipeObj.y || playerBottom > pipeObj.y + pipeGap) {
            fbGameState = "dead";
            return;
          }
        }
      }
    }

    function resetGame() {
      // drywall clicker integration
      const player = gameState.player;
      if (player && score > player.minigames.flappyBird.best) {
        player.minigames.flappyBird.best = score;
      }

      playerY = p.height / 2;
      playerVel = 0;
      pipes = [];
      score = 0;
      bgX = 0;
      baseX = 0;
      pipeGap = 160;
      scrollSpeed = 3;
      fbGameState = "start";
    }
  };

  return new p5(sketch);
}

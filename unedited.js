// Files
let font;
let cubeImage;
let shipImage;
let waveImage;

// Settings
let debugPrecision = 2;
let maxIts = 5;

let levelSelectCols = 4;
let levelSelectRows = 3;
let levelSelectSize = 150;
let levelSelectSpacing = 20;

let tileSize = 60;
let noclip = false;
let debug = true;
let hitboxesEnabled = true;
let gameState = "menu";
let shipMaxSpeed = 10;
let cubeGravity = 1.35;
let shipGravity = 0.5;
let shipThrust = 1.1;
let fps = 120;
let slowFPS = 4;
let gameSlowed = false;

let hitboxes = {
  block: {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    type: "solid",
  },
  slab: {
    x: 0,
    y: -0.25,
    w: 1,
    h: 0.5,
    type: "solid",
  },
  spike: {
    x: 0,
    y: 0.15,
    w: 0.2,
    h: 0.5,
    type: "kill",
  },
  "half-spike": {
    x: 0,
    y: 0.3,
    w: 0.2,
    h: 0.2,
    type: "kill",
  },
  cubePortal: {
    x: 0,
    y: 0,
    w: 1.4,
    h: 3.4,
    type: "portal",
  },
  shipPortal: {
    x: 0,
    y: 0,
    w: 1.4,
    h: 3.4,
    type: "portal",
  },
  wavePortal: {
    x: 0,
    y: 0,
    w: 1.4,
    h: 3.4,
    type: "portal",
  },
  ufoPortal: {
    x: 0,
    y: 0,
    w: 1.4,
    h: 3.4,
    type: "portal",
  },
  robotPortal: {
    x: 0,
    y: 0,
    w: 1.4,
    h: 3.4,
    type: "portal",
  },
};

const portalTypes = [
  "cubePortal",
  "shipPortal",
  "wavePortal",
  "ufoPortal",
  "robotPortal",
];

// variables
let levels, level;
let levelEnd = 0;

let placingR = 0;
let placingType = false;

let camX = 0;
let camY = 0;
let camXV = 0;
let camYV = 0;
let camFric = 0.8;
let camAcc = 3;
let portalType = 0;

let cameraMoving = false;

let playerOnGround = false;
let playerCollided = false;
let player = {
  x: 0,
  y: -tileSize / 2,
  r: 0,
  turnSpeed: 6.5,
  size: tileSize - 2,
  yv: 0,
  scrollSpeed: 9.5,
  jumpPower: 19,
  gravity: 1.3,
  maxSpeed: 15,
  dead: false,
  finished: false,
  borderTop: -10,
  borderBottom: 0,
  gameMode: "Cube",
};

// load
function preload() {
  font = loadFont("pusab.otf");
  levels = loadStrings("levels.txt");
  cubeImage = loadImage("cube.png");
  shipImage = loadImage("ship.png");
  waveImage = loadImage("wave.png");
}

function setup() {
  createCanvas(screen.width, screen.height);
  angleMode(DEGREES);

  for (let i = 0; i < levels.length; i += 1) {
    levels[i] = JSON.parse(levels[i]);
  }

  // if (getItem("level")) {
  //  level = getItem("level");
  // }
}

// helpers
function rectCollision(x1, y1, w1, h1, x2, y2, w2, h2, alignment1, alignment2) {
  if (alignment1 == "CORNER" || !alignment1) {
    var l1 = x1;
    var r1 = x1 + w1;
    var t1 = y1;
    var b1 = y1 + h1;
  } else if (alignment1 == "CENTER") {
    var l1 = x1 - w1 / 2;
    var r1 = x1 + w1 / 2;
    var t1 = y1 - h1 / 2;
    var b1 = y1 + h1 / 2;
  }

  if (alignment2 == "CORNER" || !alignment2) {
    var l2 = x2;
    var r2 = x2 + w2;
    var t2 = y2;
    var b2 = y2 + h2;
  } else if (alignment2 == "CENTER") {
    var l2 = x2 - w2 / 2;
    var r2 = x2 + w2 / 2;
    var t2 = y2 - h2 / 2;
    var b2 = y2 + h2 / 2;
  }

  if (l1 < r2 && r1 > l2) {
    if (t1 < b2 && b1 > t2) {
      return true;
    }
  }
}

function hover(x, y, w, h, align) {
  var l, r, t, b;
  if (align == "CENTER") {
    l = x - w / 2;
    r = x + w / 2;
    t = y - h / 2;
    b = y + h / 2;
  } else {
    l = x;
    r = x + w;
    t = y;
    b = y + h;
  }

  if (mouseX > l && mouseX < r) {
    if (mouseY > t && mouseY < b) {
      return true;
    }
  }
  return false;
}

// events
function mousePressed() {
  if (gameState == "menu") {
    let halfCols = levelSelectCols / 2 - 0.5;
    let halfRows = levelSelectRows / 2 - 0.5;
    let spacing = levelSelectSpacing + levelSelectSize;
    for (let x = 0; x < levelSelectCols; x += 1) {
      for (let y = 0; y < levelSelectRows; y += 1) {
        let index = x + y * levelSelectCols;
        if (index < levels.length) {
          let tx = width / 2 - halfCols * spacing + x * spacing;
          let ty = height / 2 - halfRows * spacing + y * spacing;

          if (hover(tx, ty, levelSelectSize, levelSelectSize, "CENTER")) {
            startLevel(index);
          }
        } else {
          break;
        }
      }
    }
  }

  if (gameState == "editor") {
    let mx = floor((mouseX + camX - width / 2) / tileSize);
    let my = floor((mouseY + camY - height / 2) / tileSize);

    if (placingType) {
      if (placingType == "erase") {
        for (let i = 0; i < level.length; i += 1) {
          let b = level[i];
          if (b.x == mx && b.y == my) {
            level.splice(i, 1);
            break;
          }
        }
      } else {
        level.push({ type: placingType, x: mx, y: my, r: placingR });
      }
      return;
    }
  }
}

function keyTyped() {
  if (key == "f") {
    fullscreen(!fullscreen());
  }

  if (key == "e") {
    mousePressed();
  }

  if (key == "p") {
    startLevel();
  }

  if (key == "o") {
    outputLevel();
  }

  if (key == "e") {
    gameState = "editor";
  }

  if (gameState == "editor") {
    if (key == "0") {
      placingType = "erase";
    } else if (key == "1") {
      placingType = "block";
    } else if (key == "2") {
      placingType = "slab";
    } else if (key == "3") {
      placingType = "spike";
    } else if (key == "4") {
      placingType = "half-spike";
    } else if (key == "9") {
      portalType = portalType % portalTypes.length;
      placingType = portalTypes[portalType];
      portalType += 1;
    } else if (key == "r") {
      placingR += 90;
      placingR = placingR % 360;
    }
  }
}

// functions
function clearLevel() {
  level = [];
}

function checkEnd() {
  levelEnd = 700;
  for (let i of level) {
    if (i.x * tileSize > levelEnd) {
      levelEnd = i.x * tileSize;
    }
  }
  levelEnd += 3 * tileSize;
}

function shapeOverlap(tl1, tr1, bl1, br1, tl2, tr2, bl2, br2) {
  const poly1 = [tl1, tr1, br1, bl1];
  const poly2 = [tl2, tr2, br2, bl2];

  return polygonsOverlap(poly1, poly2);
}

function polygonsOverlap(p1, p2) {
  // Check both polygon edges
  return !hasSeparatingAxis(p1, p2) && !hasSeparatingAxis(p2, p1);
}

function hasSeparatingAxis(polyA, polyB) {
  for (let i = 0; i < polyA.length; i++) {
    const p1 = polyA[i];
    const p2 = polyA[(i + 1) % polyA.length];

    // Edge vector
    const edge = { x: p2.x - p1.x, y: p2.y - p1.y };

    // Perpendicular axis
    const axis = { x: -edge.y, y: edge.x };

    // Project both polygons onto this axis
    const [minA, maxA] = projectPolygon(polyA, axis);
    const [minB, maxB] = projectPolygon(polyB, axis);

    // If projections do not overlap → separating axis found
    if (maxA < minB || maxB < minA) {
      return true;
    }
  }
  return false;
}

function projectPolygon(poly, axis) {
  let min = Infinity;
  let max = -Infinity;

  for (const p of poly) {
    // Dot product to project
    const proj = p.x * axis.x + p.y * axis.y;
    if (proj < min) min = proj;
    if (proj > max) max = proj;
  }
  return [min, max];
}

// collision
function checkPlayerCollision() {
  collisions = [];
  collisions2 = [];
  if (player.gameMode == "Cube") {
    if (player.y > -player.size / 2) {
      collisions.push("ground");
    }
  } else if (player.gameMode == "Ship" || player.gameMode == "Wave") {
    if (player.y > player.borderBottom * tileSize - player.size / 2) {
      collisions.push("ground-bottom");
    }
    if (player.y < player.borderTop * tileSize + player.size / 2) {
      collisions.push("ground-top");
    }
  }

  for (let b = 0; b < level.length; b += 1) {
    let block = level[b];
    if (
      (abs(player.x - block.x * tileSize) < 400) &
      (abs(player.y - block.y * tileSize) < 400)
    ) {
      let baseHitbox = hitboxes[block.type];

      let corners = [
        createVector(
          baseHitbox.x - baseHitbox.w / 2,
          baseHitbox.y - baseHitbox.h / 2
        ).rotate(block.r),
        createVector(
          baseHitbox.x + baseHitbox.w / 2,
          baseHitbox.y - baseHitbox.h / 2
        ).rotate(block.r),
        createVector(
          baseHitbox.x - baseHitbox.w / 2,
          baseHitbox.y + baseHitbox.h / 2
        ).rotate(block.r),
        createVector(
          baseHitbox.x + baseHitbox.w / 2,
          baseHitbox.y + baseHitbox.h / 2
        ).rotate(block.r),
      ];
      for (let i of corners) {
        i.x += block.x + 0.5;
        i.y += block.y + 0.5;
        i.x *= tileSize;
        i.y *= tileSize;
      }

      let tl1 = { x: corners[0].x, y: corners[0].y };
      let tr1 = { x: corners[1].x, y: corners[1].y };
      let bl1 = { x: corners[2].x, y: corners[2].y };
      let br1 = { x: corners[3].x, y: corners[3].y };
      let tl2 = {
        x: player.x - player.size / 2,
        y: player.y - player.size / 2,
      };
      let tr2 = {
        x: player.x + player.size / 2,
        y: player.y - player.size / 2,
      };
      let bl2 = {
        x: player.x - player.size / 2,
        y: player.y + player.size / 2,
      };
      let br2 = {
        x: player.x + player.size / 2,
        y: player.y + player.size / 2,
      };
      let tl3 = {
        x: player.x - player.size / 8,
        y: player.y - player.size / 8,
      };
      let tr3 = {
        x: player.x + player.size / 8,
        y: player.y - player.size / 8,
      };
      let bl3 = {
        x: player.x - player.size / 8,
        y: player.y + player.size / 8,
      };
      let br3 = {
        x: player.x + player.size / 8,
        y: player.y + player.size / 8,
      };

      if (shapeOverlap(tl1, tr1, bl1, br1, tl2, tr2, bl2, br2)) {
        if (hitboxes[block.type].type == "portal") {
          collisions.push(block.type);
        } else {
          collisions.push(hitboxes[block.type].type);
        }
      }
      if (shapeOverlap(tl1, tr1, bl1, br1, tl3, tr3, bl3, br3)) {
        if (hitboxes[block.type].type == "portal") {
          collisions2.push(block.type);
        } else {
          collisions2.push(hitboxes[block.type].type);
        }
      }
    }
  }

  return [collisions, collisions2];
}

function startLevel(levelID) {
  if (levelID !== undefined) {
    level = levels[levelID];
  } else if (!level) {
    level = levels[0];
  }

  gameState = "playing";
  player.dead = false;
  player.finished = false;
  player.x = 0;
  player.y = -ceil(player.size / 2);
  player.r = 0;
  player.yv = 0;

  player.gameMode = "Cube";
}

function killPlayer() {
  player.dead = true;
  player.x = 0;
  player.xv = 0;
  player.yv = 0;
  player.gameMode = "Cube";
  player.y = -player.size * 0.5;
  player.r = 0;
  //   for (let i = 0; i < level.length; i += 1) {

  //   }
  setTimeout(function () {
    player.dead = false;
  }, 600);
}

function movePlayer() {
  const dtScale = gameSlowed ? 1 : deltaTime * 60 / 1000;
  
  const totalDy = Math.abs(player.yv * dtScale);
  const totalDx = Math.abs(player.scrollSpeed * dtScale);
  const steps = Math.ceil(Math.max(totalDy, totalDx, 1));
  const stepDt = dtScale / steps;

  playerOnGround = false;

  for (let s = 0; s < steps; s++) {
    if (!updateHorizontalMovement(stepDt)) return;
    if (!updateVerticalMovement(stepDt)) return;
  }
  
  handlePlayerInput(dtScale);
  updatePlayerRotation(dtScale);
  checkLevelCompletion();
}

function updateHorizontalMovement(stepDt) {
  player.x += player.scrollSpeed * stepDt;
  
  const collision = checkPlayerCollision();
  if (collision[0].includes("kill") || collision[1].includes("solid")) {
    killPlayer();
    return false;
  }
  
  handlePortalCollision(collision[0]);
  return true;
}

function updateVerticalMovement(stepDt) {
  applyGravity(stepDt);
  clampVerticalSpeed();
  
  player.y += player.yv * stepDt;
  
  const collision = checkPlayerCollision();
  if (collision[0].includes("kill") || collision[1].includes("solid")) {
    killPlayer();
    return false;
  }
  
  handlePortalCollision(collision[0]);
  resolveCollisions(collision);
  return true;
}

function applyGravity(stepDt) {
  const isCubeOrRobot = player.gameMode === "Cube" || player.gameMode === "Robot";
  const gravityStrength = isCubeOrRobot ? cubeGravity : shipGravity;
  
  player.gravity = gravityStrength * stepDt;
  player.yv += player.gravity;
  player.maxSpeed = isCubeOrRobot ? 20 : 10;
}

function clampVerticalSpeed() {
  if (Math.abs(player.yv) > player.maxSpeed) {
    player.yv = Math.sign(player.yv) * player.maxSpeed;
  }
}

function handlePortalCollision(collisionTypes) {
  const portals = {
    cubePortal: "Cube",
    shipPortal: "Ship",
    wavePortal: "Wave",
    ufoPortal: "UFO",
    robotPortal: "Robot",
    ballPortal: "Ball"
  };
  
  for (const [portal, mode] of Object.entries(portals)) {
    if (collisionTypes.includes(portal)) {
      player.gameMode = mode;
      break;
    }
  }
}

function resolveCollisions(collision) {
  const [current, previous] = collision;
  
  // Handle ground collisions (floor and ceiling)
  if (current.includes("ground") || current.includes("ground-bottom") || current.includes("ground-top")) {
    resolveGroundCollision(current);
  } 
  // Handle solid block collisions
  else if (current.includes("solid") && !previous.includes("solid")) {
    resolveSolidCollision(previous);
  }
  // Check if near ground/solid surface (within 2 pixels below)
  else if (!playerOnGround) {
    checkIfNearGround();
  }
}

function checkIfNearGround() {
  // Save current position
  const originalY = player.y;
  
  // Move player down up to 2 pixels and check for collision
  for (let i = 1; i <= 2; i++) {
    player.y += 1;
    const collision = checkPlayerCollision();
    if (collision[0].includes("ground") || collision[0].includes("ground-bottom") || 
        collision[0].includes("ground-top") || collision[0].includes("solid")) {
      playerOnGround = true;
      player.y = originalY; // Restore position
      return;
    }
  }
  
  // Restore original position
  player.y = originalY;
}

function resolveGroundCollision(collisionTypes) {
  const isCube = player.gameMode === "Cube";
  const isShipOrWave = player.gameMode === "Ship" || player.gameMode === "Wave";
  
  // For cube mode - only floor collision
  if (isCube && collisionTypes.includes("ground")) {
    let attempts = 0;
    // Try moving up first
    while (checkPlayerCollision()[0].includes("ground") && attempts < 30) {
      player.y -= 1;
      attempts++;
    }
    // If still colliding, try moving down
    if (checkPlayerCollision()[0].includes("ground")) {
      attempts = 0;
      while (checkPlayerCollision()[0].includes("ground") && attempts < 30) {
        player.y += 1;
        attempts++;
      }
    }
    player.yv = 0;
    playerOnGround = true;
  }
  
  // For ship/wave mode - handle ceiling and floor separately
  if (isShipOrWave) {
    if (collisionTypes.includes("ground-top")) {
      // Hit ceiling - try both directions
      let attempts = 0;
      while (checkPlayerCollision()[0].includes("ground-top") && attempts < 30) {
        player.y += 1;
        attempts++;
      }
      if (checkPlayerCollision()[0].includes("ground-top")) {
        attempts = 0;
        while (checkPlayerCollision()[0].includes("ground-top") && attempts < 30) {
          player.y -= 1;
          attempts++;
        }
      }
      player.yv = Math.max(0, player.yv);
      playerOnGround = true;
    }
    
    if (collisionTypes.includes("ground-bottom")) {
      // Hit floor - try both directions
      let attempts = 0;
      while (checkPlayerCollision()[0].includes("ground-bottom") && attempts < 30) {
        player.y -= 1;
        attempts++;
      }
      if (checkPlayerCollision()[0].includes("ground-bottom")) {
        attempts = 0;
        while (checkPlayerCollision()[0].includes("ground-bottom") && attempts < 30) {
          player.y += 1;
          attempts++;
        }
      }
      player.yv = Math.min(0, player.yv);
      playerOnGround = true;
    }
  }
}

function resolveSolidCollision(previousCollision) {
  const isCubeOrRobot = player.gameMode === "Cube" || player.gameMode === "Robot";
  
  // Moving upward (negative yv) - hitting head/ceiling
  if (player.yv < 0) {
    if (isCubeOrRobot) {
      // Cube/Robot hitting head on block = death
      killPlayer();
      return;
    }
  }
  
  // Try moving up first
  let attempts = 0;
  while (checkPlayerCollision()[0].includes("solid") && attempts < 30) {
    player.y -= 1;
    attempts++;
  }
  
  // If still colliding, try moving down
  if (checkPlayerCollision()[0].includes("solid")) {
    attempts = 0;
    while (checkPlayerCollision()[0].includes("solid") && attempts < 30) {
      player.y += 1;
      attempts++;
    }
  }
  
  player.yv = 0;
  playerOnGround = true;
}

function handlePlayerInput(dtScale) {
  const isInputActive = keyIsDown(UP_ARROW) || keyIsDown(87) || 
                        mouseIsPressed || keyIsDown(32);
  
  if (!isInputActive) return;
  
  if (player.gameMode === "Cube" && playerOnGround) {
    player.yv = -player.jumpPower;
    player.y -= 1;
  } else if (player.gameMode === "Ship") {
    const thrust = playerOnGround ? shipThrust * 2 : shipThrust;
    player.yv -= thrust * dtScale;
  }
}

function updatePlayerRotation(dtScale) {
  if (player.gameMode === "Cube") {
    if (playerOnGround) {
      const targetRotation = Math.round(player.r / 90) * 90;
      player.r += ((targetRotation - player.r) * dtScale) / 2;
    } else {
      player.r += player.turnSpeed * dtScale;
    }
  } else if (player.gameMode === "Ship") {
    player.r = player.yv * 2;
  } else if (player.gameMode === "Wave") {
    player.r = Math.sign(player.yv) * 45;
  }
}

function checkLevelCompletion() {
  checkEnd();
  
  if (player.x >= levelEnd && !player.finished) {
    player.finished = true;
    setTimeout(() => {
      if (gameState === "playing") {
        gameState = "menu";
      }
    }, 5000);
  }
}

function moveCamera(smoothness) {
  camX += (player.x - camX) / smoothness;
  if (player.gameMode == "Ship") {
    camY = ((player.borderTop + player.borderBottom) * tileSize) / 2;
  } else if (player.gameMode == "Cube" || player.gameMode == "Robot") {
    if (abs(player.y - (camY - 200)) > 200) {
      cameraMoving = player.yv;
    }
    if (Math.sign(cameraMoving) != Math.sign(player.yv)) {
      cameraMoving = false;
    }
    if (cameraMoving !== false) {
      camY += (player.y - camY) / 32;
    }
  }
}

function outputLevel() {
  console.log(JSON.stringify(level));
}

// visual functions
function drawGrid() {
  stroke(20, 50);
  strokeWeight(2);
  let numRows = ceil(height / tileSize) + 2;
  for (let i = 0; i < numRows; i += 1) {
    let y = -tileSize * floor(numRows / 2) + floor(camY / tileSize) * tileSize;
    y += i * tileSize;
    line(-10, y - camY + height / 2, width + 10, y - camY + height / 2);
  }
  let numCols = ceil(width / tileSize) + 2;
  for (let i = 0; i < numCols; i += 1) {
    let x = -tileSize * floor(numCols / 2) + floor(camX / tileSize) * tileSize;
    x += i * tileSize;
    line(x - camX + width / 2, -10, x - camX + width / 2, height + 10);
  }
}

function drawObject(type, bx, by, r) {
  rectMode(CORNER);
  stroke(240);
  strokeWeight(2);
  fill(20, 200);

  push();
  translate(bx + tileSize / 2, by + tileSize / 2);
  rotate(r);
  if (
    bx >= camX - width / 2 - tileSize * 2 &&
    bx <= camX + width / 2 + tileSize * 2 &&
    by >= camY - height / 2 - 100 &&
    by <= camY + height / 2 + 100
  ) {
    if (type == "erase") {
      noFill();
      stroke(255, 50, 50);
      strokeWeight(4);
      line(-tileSize / 2, -tileSize / 2, tileSize / 2, tileSize / 2);
      line(-tileSize / 2, tileSize / 2, tileSize / 2, -tileSize / 2);
    } else if (type == "block") {
      rect(-tileSize / 2, -tileSize / 2, tileSize, tileSize);
    } else if (type == "slab") {
      rect(-tileSize / 2, -tileSize / 2, tileSize, tileSize * 0.5);
    } else if (type == "spike") {
      beginShape();
      vertex(-tileSize / 2, tileSize / 2);
      vertex(tileSize / 2, tileSize / 2);
      vertex(0, -tileSize / 2);
      endShape(CLOSE);
    } else if (type == "half-spike") {
      beginShape();
      vertex(-tileSize / 2, tileSize / 2);
      vertex(tileSize / 2, tileSize / 2);
      vertex(0, 0);
      endShape(CLOSE);
    } else if (type == "cubePortal") {
      noStroke();
      fill(50, 200, 60);
      beginShape();
      vertex(-tileSize / 2, -1.3 * tileSize);
      vertex(tileSize / 2, -tileSize / 2);
      vertex(tileSize / 2, tileSize / 2);
      vertex(-tileSize / 2, 1.3 * tileSize);
      endShape(CLOSE);
    } else if (type == "shipPortal") {
      noStroke();
      fill(240, 50, 200);
      beginShape();
      vertex(-tileSize / 2, -1.3 * tileSize);
      vertex(tileSize / 2, -tileSize / 2);
      vertex(tileSize / 2, tileSize / 2);
      vertex(-tileSize / 2, 1.3 * tileSize);
      endShape(CLOSE);
    } else if (type == "wavePortal") {
      noStroke();
      fill(50, 150, 200);
      beginShape();
      vertex(-tileSize / 2, -1.3 * tileSize);
      vertex(tileSize / 2, -tileSize / 2);
      vertex(tileSize / 2, tileSize / 2);
      vertex(-tileSize / 2, 1.3 * tileSize);
      endShape(CLOSE);
    } else if (type == "robotPortal") {
      noStroke();
      fill(230);
      beginShape();
      vertex(-tileSize / 2, -1.3 * tileSize);
      vertex(tileSize / 2, -tileSize / 2);
      vertex(tileSize / 2, tileSize / 2);
      vertex(-tileSize / 2, 1.3 * tileSize);
      endShape(CLOSE);
    } else if (type == "ufoPortal") {
      noStroke();
      fill(240, 160, 50);
      beginShape();
      vertex(-tileSize / 2, -1.3 * tileSize);
      vertex(tileSize / 2, -tileSize / 2);
      vertex(tileSize / 2, tileSize / 2);
      vertex(-tileSize / 2, 1.3 * tileSize);
      endShape(CLOSE);
    }
  }
  pop();
}

function drawLevel() {
  for (let b = 0; b < level.length; b += 1) {
    let block = level[b];

    let bx = block.x * tileSize;
    let by = block.y * tileSize;
    if (
      bx >= camX - width - 100 &&
      bx <= camX + width + 100 &&
      by >= camY - height - 100 &&
      by <= camY + height + 100
    ) {
      drawObject(block.type, bx, by, block.r);

      if (hitboxesEnabled) {
        let hitbox = hitboxes[block.type];
        push();
        translate(bx + tileSize / 2, by + tileSize / 2);

        noFill();
        if (hitbox.type == "solid") {
          stroke(0, 255, 255);
        } else if (hitbox.type == "kill") {
          stroke(255, 0, 0);
        } else if (hitbox.type == "portal") {
          stroke(255, 0, 255);
        }

        strokeWeight(2);
        rectMode(CENTER);
        rotate(block.r);
        rect(
          hitbox.x * tileSize,
          hitbox.y * tileSize,
          tileSize * hitbox.w - 2,
          tileSize * hitbox.h - 2
        );

        pop();
      }
    }
  }
  rectMode(CORNER);
  stroke(255, 200);
  strokeWeight(2);
  fill(40);
  rect(levelEnd + 300 - tileSize / 2, -10000, width, 20000);
}

function drawGround() {
  resetMatrix();

  noStroke();
  rectMode(CORNER);
  fill(10, 15, 100);
  if (player.gameMode == "Cube") {
    rect(0, (height * 2) / 3 - camY, width, 10000);
  } else if (player.gameMode == "Ship" || player.gameMode == "Wave") {
    rect(
      0,
      player.borderTop * tileSize + height / 2 - camY - 1000,
      width,
      1000
    );
    rect(0, player.borderBottom * tileSize + height / 2 - camY, width, 1000);
  }
}

function checkColors() {
  let colors = {
    bg: [20, 25, 255],
    groundColor: [],
    groundLine: [],
    border: [250, 250, 250],
    blockColor: [20, 20, 20, 200],
  };
}

function finishAnimation(smoothness) {
  player.x += (levelEnd + 400 - player.x) / smoothness;
  player.y += (5 * -tileSize - player.y) / smoothness;
  camY = player.y + tileSize;
  player.r += sin(frameCount * 3) * 5;
  let opacity = max(0, 300 - (levelEnd + 400 - player.x));
  resetMatrix();
  textAlign(CENTER, CENTER);
  fill(255, opacity);
  stroke(20, opacity);
  strokeWeight(8);
  textSize(64);
  text("Level Complete!", width / 2, height / 2);
}

// draw loop
function draw() {
  textFont(font);

  if (gameState == "menu") {
    noStroke();
    background(50, 55, 70);

    // Level Select
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    textSize(32);
    noStroke();

    let halfCols = levelSelectCols / 2 - 0.5;
    let halfRows = levelSelectRows / 2 - 0.5;
    let spacing = levelSelectSpacing + levelSelectSize;
    for (let x = 0; x < levelSelectCols; x += 1) {
      for (let y = 0; y < levelSelectRows; y += 1) {
        let index = x + y * levelSelectCols;
        if (index < levels.length) {
          fill(70, 75, 90);

          let tx = width / 2 - halfCols * spacing + x * spacing;
          let ty = height / 2 - halfRows * spacing + y * spacing;

          rect(tx, ty, levelSelectSize, levelSelectSize, levelSelectSize / 8);

          fill(240);
          text(index + 1, tx, ty);
        } else {
          break;
        }
      }
    }
  } else if (gameState == "playing") {
    checkColors();
    background(20, 25, 200);

    if (player.dead === false && player.finished === false) {
      movePlayer();
    }

    if (player.finished === false) {
      moveCamera(1);
    }

    drawGround();

    push();
    if (player.gameMode == "Cube" || player.gameMode == "Robot") {
      translate(width * 0.4 - camX, (height * 2) / 3 - camY);
    } else {
      translate(width * 0.4 - camX, height / 2 - camY);
    }

    rectMode(CENTER);
    imageMode(CENTER);
    push();
    translate(player.x, player.y);

    // draw player
    rotate(player.r);
    fill(110, 140, 255);
    noStroke();
    if (player.gameMode == "Cube") {
      image(cubeImage, 0, 0, player.size, player.size);
    } else if (player.gameMode == "Ship") {
      image(shipImage, 0, 0, player.size * 1.2, player.size * 1.2);
    } else if (player.gameMode == "Wave") {
      image(waveImage, 0, 0, player.size * 1.5, player.size * 1.5);
    }

    noFill();
    if (hitboxesEnabled) {
      rotate(-player.r);
      // kill (outer) hitbox
      stroke(255, 0, 0);
      rect(0, 0, player.size, player.size);

      // solid (inner/small) hitbox
      stroke(0, 0, 255);
      rect(0, 0, player.size / 4, player.size / 4);
    }

    pop();

    drawLevel();

    if (player.finished) {
      finishAnimation(24);
    }

    pop();
  } else if (gameState == "editor") {
    checkColors();
    background(20, 25, 200);
    if (keyIsDown(65)) {
      camXV -= camAcc;
    }
    if (keyIsDown(68)) {
      camXV += camAcc;
    }
    if (keyIsDown(87)) {
      camYV -= camAcc;
    }
    if (keyIsDown(83)) {
      camYV += camAcc;
    }
    if (keyIsDown(SHIFT)) {
      camXV *= 1.2;
      camYV *= 1.2;
    }
    camXV *= camFric;
    camYV *= camFric;

    camX += camXV;
    camY += camYV;

    resetMatrix();
    drawGrid();
    noStroke();
    rectMode(CORNER);
    fill(10, 15, 100);
    rect(0, height / 2 - camY, width, 10000);

    translate(width / 2 - camX, height / 2 - camY);
    checkEnd();
    drawLevel();

    let mx = floor((mouseX + camX - width / 2) / tileSize);
    let my = floor((mouseY + camY - height / 2) / tileSize);

    drawObject(placingType, mx * tileSize, my * tileSize, placingR);
  }

  resetMatrix();
  let coll;
  stroke(20);
  strokeWeight(2);
  fill(255);
  textSize(16);
  textAlign(RIGHT, TOP);
  text("fps: " + round(frameRate()), width - 5, 5);
  textAlign(LEFT, TOP);
  if (debug) {
    text("xpos: " + round(player.x, debugPrecision), 5, 5);
    text("ypos: " + round(player.y, debugPrecision), 5, 25);
    text("camX: " + round(camX, debugPrecision), 5, 45);
    text("camY: " + round(camY, debugPrecision), 5, 65);
    text("gamemode: " + player.gameMode, 5, 85);
    text("onGround: " + playerOnGround, 5, 105);
  }

  if (keyIsDown(82)) {
    gameSlowed = true;
    frameRate(slowFPS);
  } else {
    gameSlowed = false;
    frameRate(fps);
  }

  if (frameCount % 120 == 0 && level) {
    storeItem("level", level);
  }
}
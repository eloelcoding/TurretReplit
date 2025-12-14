const STOPSIGN = ".";

// Enemy type definitions
const EnemyTypes = {
  BASIC: {
    name: "Scout",
    healthMultiplier: 1.0,
    speed: 1,
    damage: 2,
    color: [180, 50, 120],  // Magenta
    size: 1.0,
    rewardMultiplier: 1.0
  },
  FAST: {
    name: "Runner",
    healthMultiplier: 0.7,
    speed: 2.5,
    damage: 1,
    color: [100, 200, 255],  // Cyan/Blue
    size: 0.85,
    rewardMultiplier: 1.2
  },
  TANK: {
    name: "Destroyer",
    healthMultiplier: 2.5,
    speed: 0.6,
    damage: 4,
    color: [255, 80, 80],  // Red
    size: 1.3,
    rewardMultiplier: 2.0
  },
  ELITE: {
    name: "Elite",
    healthMultiplier: 1.8,
    speed: 1.5,
    damage: 3,
    color: [255, 200, 0],  // Gold
    size: 1.15,
    rewardMultiplier: 2.5
  }
};

class EnemyController {
  constructor(path) {
    this.enemies = [];
    this.path = path;
    this._enemyHealth = config.enemyHealth;
    this._enemyType = "BASIC";
  }

  setEnemyHealth(health) {
    this._enemyHealth = floor(health)
  }
  
  setEnemyType(type) {
    this._enemyType = type;
  }

  cleanup() {
    this.enemies = this.enemies.filter(e => e.alive);
  }

  createEnemy(type = null) {
    // Use provided type or default to current type
    var enemyType = type || this._enemyType;
    var typeConfig = EnemyTypes[enemyType] || EnemyTypes.BASIC;
    
    // Calculate health based on type multiplier
    var health = floor(this._enemyHealth * typeConfig.healthMultiplier);
    
    var newEnemy = new Enemy(this.path.x, this.path.y, health, typeConfig);
    newEnemy.setDirections(this.path.path);
    newEnemy.moveAmount = this.path.size;  // Match path tile size
    this.enemies.push(newEnemy);
  }

  initialize() {
    // Don't auto-spawn - let WaveManager handle it
    // This method is kept for compatibility but does nothing
  }

  targetEnemy(x, y, range) {
    var enemiesAliveAndNear = this.enemies.filter((enemy) => enemy.alive);
    enemiesAliveAndNear = enemiesAliveAndNear.filter((enemy) => {
      var distance = dist(x, y, enemy.x, enemy.y);
      return distance < range;
    })

    if (enemiesAliveAndNear.length == 0) return; //most advanced enemy
    // sort enemies based on their positionOnTrack
    enemiesAliveAndNear.sort((e1, e2) => e2.positionOnTrack - e1.positionOnTrack);
    var enemyToShoot = enemiesAliveAndNear[0];
    return enemyToShoot;
  }

  draw() {
    this.enemies.map((enemy) => {
      enemy.draw();
      enemy.move();
    });
  }
}



class Enemy {
  constructor(startX, startY, health, typeConfig = null) {
    // Center enemy on the path tile
    let pathSize = config.path.size || 40;
    this.x = startX + pathSize / 2;
    this.y = startY + pathSize / 2;
    
    // Use type config or default to BASIC
    this.typeConfig = typeConfig || EnemyTypes.BASIC;
    this.type = this.typeConfig.name;
    
    // Set properties based on type
    this.size = 28 * (config.scale || 1) * this.typeConfig.size;
    this.speed = this.typeConfig.speed;
    this.alive = true;
    this.health = health;
    this.originalHealth = health;
    this.damage = this.typeConfig.damage;
    this.positionOnTrack = 0;
    this.moveAmount = 40;  // Base value, will be overwritten by path size
    
    // Ring rotation angles (different speeds create the opening effect)
    this.ringAngles = [
      random(TWO_PI),
      random(TWO_PI),
      random(TWO_PI)
    ];
    // Ring rotation speeds - 1st and 3rd same direction, middle opposite
    let baseDir = random() > 0.5 ? 1 : -1;
    this.ringSpeeds = [
      random(0.02, 0.035) * baseDir,       // Outer - slowest
      random(0.04, 0.055) * -baseDir,      // Middle - opposite direction
      random(0.06, 0.08) * baseDir         // Inner - fastest, same as outer
    ];
    
    // Pulsation parameters
    this.pulsePhase = random(TWO_PI);
    this.pulseSpeed = random(0.03, 0.06);
    this.directions = ""; // Store the directions as a string
    this.currentDirectionIndex = 0; // Track the current direction
    this.zoom = 1;
    
    // Spawn/despawn animation
    this.spawnScale = 0.1;  // Start tiny
    this.fadeAlpha = 255;   // Full opacity
    this.isSpawning = true;
    this.isDespawning = false;
  }

  setDirections(directions) {
    if (directions == undefined)
      throw new Error("Directions are not defined");
    // Set the directions for the enemy to follow
    this.directions = directions.concat([STOPSIGN]);
    this.currentDirectionIndex = 0; // Reset the direction index
  }

  hit(hitPower) {
    this.hitPower = hitPower;
    this.health -= this.hitPower;
    this.health = max(0, this.health)
    createjs.Tween.get(this)
      .to({ zoom: 0.7 }, 50, createjs.Ease.getPowInOut(1))
      .to({ zoom: 1 }, 100, createjs.Ease.getPowInOut(1))

    if (this.health <= 0) {
      config.playSound("boom");
      // Spawn death effect particles (purple/magenta alien explosion)
      effectsManager.spawnDeathEffect(this.x, this.y, [170, 60, 180]);
      createjs.Tween.get(this)
        .to({ zoom: 0.3 }, 100, createjs.Ease.getPowInOut(1))
        .call(() => this.destroy())
      // Reward based on type multiplier
      var baseReward = this.damage * this.originalHealth / 2;
      game.money += floor(baseReward * this.typeConfig.rewardMultiplier);
    }
  }

  destroy() {
    this.alive = false;
    game.enemyController.cleanup();
  }

  move() {
    if (!this.alive) return;
    if (this.directions.length > 0) {
      // Get the current direction
      var slow = 10 * this.speed;
      var positionOnTrack = floor(this.currentDirectionIndex / slow);
      this.positionOnTrack = positionOnTrack;
      const currentDirection = this.directions[positionOnTrack];
      if (currentDirection === "R") this.x += this.moveAmount / slow;
      else if (currentDirection === "L") this.x -= this.moveAmount / slow;
      else if (currentDirection === "D") this.y += this.moveAmount / slow;
      else if (currentDirection === "U") this.y -= this.moveAmount / slow;
      else if (currentDirection === STOPSIGN) {
        // Start despawn animation instead of instant death
        if (!this.isDespawning) {
          this.isDespawning = true;
          game.takeHit(this.damage);
        }
      } else if (currentDirection != STOPSIGN)
        throw new Error(`Wrong character for a path: ${currentDirection}!`);

      if (positionOnTrack < this.directions.length - 1) {
        this.currentDirectionIndex++;
      }
    }
  }

  drawHealthBar() {
    let barWidth = this.size + 10;
    let barHeight = 6;
    let barY = -this.size / 2 - 12;
    let healthPercent = this.health / this.originalHealth;
    
    // Background (dark)
    push();
    noStroke();
    fill(40, 40, 40);
    rectMode(CORNER);
    rect(-barWidth / 2, barY, barWidth, barHeight, 2);
    
    // Health fill (gradient from green to red based on health)
    let healthColor;
    if (healthPercent > 0.6) {
      healthColor = [80, 200, 100]; // Green
    } else if (healthPercent > 0.3) {
      healthColor = [230, 180, 50]; // Yellow
    } else {
      healthColor = [220, 60, 60]; // Red
    }
    
    fill(healthColor[0], healthColor[1], healthColor[2]);
    rect(-barWidth / 2 + 1, barY + 1, (barWidth - 2) * healthPercent, barHeight - 2, 1);
    
    // Shine effect
    fill(255, 255, 255, 60);
    rect(-barWidth / 2 + 1, barY + 1, (barWidth - 2) * healthPercent, (barHeight - 2) / 2, 1);
    pop();
  }

  getEnemyType() {
    // Determine enemy type based on health/speed
    if (this.speed > 2) return 0;  // Scout (fast)
    if (this.originalHealth > 8) return 2;  // Destroyer (tanky)
    return 1;  // Fighter (default)
  }
  
  updateRings() {
    // Rotate rings
    for (let i = 0; i < 3; i++) {
      this.ringAngles[i] += this.ringSpeeds[i];
    }
    // Update pulse
    this.pulsePhase += this.pulseSpeed;
  }
  
  updateSpawnDespawn() {
    // Spawn animation - scale up from tiny
    if (this.isSpawning) {
      this.spawnScale += 0.05;
      if (this.spawnScale >= 1) {
        this.spawnScale = 1;
        this.isSpawning = false;
      }
    }
    
    // Despawn animation - fade out and shrink
    if (this.isDespawning) {
      this.fadeAlpha -= 12;
      this.spawnScale -= 0.03;
      if (this.fadeAlpha <= 0) {
        this.fadeAlpha = 0;
        this.alive = false;
        this.destroy();
      }
    }
  }

  draw() {
    if (!this.alive) return;
    
    // Update ring rotations
    this.updateRings();
    
    // Update spawn/despawn animations
    this.updateSpawnDespawn();
    
    push();
    translate(this.x, this.y)
    
    // Apply spawn scale and fade alpha
    scale(this.spawnScale);
    
    // Draw health bar (only if not despawning)
    if (!this.isDespawning) {
      this.drawHealthBar();
      
      // Draw enemy type label
      push();
      textAlign(CENTER);
      textSize(10);
      fill(this.typeConfig.color[0], this.typeConfig.color[1], this.typeConfig.color[2]);
      text(this.type, 0, -this.size / 2 - 20);
      pop();
    }
    
    push()
    scale(this.zoom)
    
    // Apply fade for despawning
    if (this.isDespawning) {
      drawingContext.globalAlpha = this.fadeAlpha / 255;
    }
    
    // Draw concentric rings with gaps
    this.drawRingEnemy();
    
    // Reset alpha
    drawingContext.globalAlpha = 1;
    
    pop();
    pop()
  }
  
  drawRingEnemy() {
    let s = this.size;
    // Use type-specific colors with variations
    let baseColor = this.typeConfig.color;
    let ringColors = [
      [baseColor[0], baseColor[1], baseColor[2]],           // Outer - base color
      [min(255, baseColor[0] + 20), min(255, baseColor[1] + 10), min(255, baseColor[2] + 10)],  // Middle - lighter
      [min(255, baseColor[0] + 40), min(255, baseColor[1] + 20), min(255, baseColor[2] + 20)]   // Inner - lightest
    ];
    
    // Pulsating radii - each ring pulses with slight offset
    let pulse1 = sin(this.pulsePhase) * 0.08;
    let pulse2 = sin(this.pulsePhase + PI * 0.7) * 0.08;
    let pulse3 = sin(this.pulsePhase + PI * 1.4) * 0.08;
    
    let ringRadii = [
      s * (1 + pulse1),
      s * (0.7 + pulse2),
      s * (0.45 + pulse3)
    ];
    let ringWidths = [s * 0.15, s * 0.12, s * 0.1];
    let gapSizes = [0.5, 0.6, 0.7];  // Gap size in radians
    
    // Outer glow - use type color
    push();
    noStroke();
    for (let i = 3; i > 0; i--) {
      fill(baseColor[0], baseColor[1], baseColor[2], 15 * i);
      ellipse(0, 0, s * 2 + i * 8, s * 2 + i * 8);
    }
    pop();
    
    // Draw each ring
    for (let i = 0; i < 3; i++) {
      this.drawRing(
        ringRadii[i],
        ringWidths[i],
        this.ringAngles[i],
        gapSizes[i],
        ringColors[i]
      );
    }
    
    // Draw center core (the "eye") - also pulsates
    let corePulse = 1 + sin(this.pulsePhase * 1.5) * 0.15;
    push();
    // Core glow
    noStroke();
    fill(255, 100, 100, 100);
    ellipse(0, 0, s * 0.35 * corePulse, s * 0.35 * corePulse);
    fill(255, 150, 150, 150);
    ellipse(0, 0, s * 0.25 * corePulse, s * 0.25 * corePulse);
    // Core
    fill(255, 200, 200);
    ellipse(0, 0, s * 0.15 * corePulse, s * 0.15 * corePulse);
    // Bright center
    fill(255, 255, 255);
    ellipse(0, 0, s * 0.06 * corePulse, s * 0.06 * corePulse);
    pop();
  }
  
  drawRing(radius, width, angle, gapSize, color) {
    push();
    rotate(angle);
    
    // Draw arc segments (ring with gap)
    stroke(color[0], color[1], color[2]);
    strokeWeight(width);
    noFill();
    
    // Calculate arc angles (full circle minus gap)
    let arcStart = gapSize / 2;
    let arcEnd = TWO_PI - gapSize / 2;
    
    arc(0, 0, radius * 2, radius * 2, arcStart, arcEnd);
    
    // Add highlight on the ring
    stroke(255, 255, 255, 60);
    strokeWeight(width * 0.3);
    arc(0, 0, radius * 2, radius * 2, arcStart + 0.2, arcStart + 1);
    
    // Add glow effect at gap edges
    noStroke();
    fill(color[0], color[1], color[2], 150);
    let gapEdge1X = cos(arcStart) * radius;
    let gapEdge1Y = sin(arcStart) * radius;
    let gapEdge2X = cos(-arcStart) * radius;
    let gapEdge2Y = sin(-arcStart) * radius;
    ellipse(gapEdge1X, gapEdge1Y, width * 0.8, width * 0.8);
    ellipse(gapEdge2X, gapEdge2Y, width * 0.8, width * 0.8);
    
    pop();
  }
}

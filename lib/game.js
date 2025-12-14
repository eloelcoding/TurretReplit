class Game {
  constructor(path) {
    this.score = config.score;
    this.maxHealth = config.score; // Track max health
    this.money = config.money;
    
    this.path = path;
    
    // Get turret positions from current map config
    let s = config.scale || 1;
    let mapConfig = config.maps[config.currentMap];
    var minDistance = 60; // Minimum distance from path in pixels
    
    this.turrets = [];
    
    // Always start with 2 turrets at level 2
    // Use positions that are well away from the path (corners of the map)
    let initialTurretPositions = [
      { TurretClass: Turret, x: 100 * s, y: 100 * s },
      { TurretClass: Turret, x: 700 * s, y: 450 * s }
    ];
    
    // Force create 2 turrets, finding valid positions if needed
    for (let i = 0; i < initialTurretPositions.length; i++) {
      let pos = initialTurretPositions[i];
      let turret = null;
      
      // Try the desired position first
      if (!this.path.isTooCloseToPath(pos.x, pos.y, minDistance)) {
        turret = new pos.TurretClass(pos.x, pos.y);
      } else {
        // Try to find a nearby valid position with larger search radius
        let validPos = this.findValidPosition(pos.x, pos.y, minDistance, 200);
        if (validPos) {
          turret = new pos.TurretClass(validPos.x, validPos.y);
        } else {
          // Last resort: try corners of the canvas
          let corners = [
            { x: 50 * s, y: 50 * s },
            { x: (config.baseWidth - 50) * s, y: 50 * s },
            { x: 50 * s, y: (config.baseHeight - 50) * s },
            { x: (config.baseWidth - 50) * s, y: (config.baseHeight - 50) * s }
          ];
          for (let corner of corners) {
            if (!this.path.isTooCloseToPath(corner.x, corner.y, minDistance)) {
              turret = new pos.TurretClass(corner.x, corner.y);
              break;
            }
          }
        }
      }
      
      if (turret) {
        turret.level = 2; // Start at level 2
        this.turrets.push(turret);
      }
    }
    this.shop = new Shop(true);
    this.enemyController = new EnemyController(path);
    this.waveManager = new WaveManager(this.enemyController);
  }

  // Find a valid position near the desired position that's not too close to the path
  findValidPosition(desiredX, desiredY, minDistance, searchRadius) {
    // Try positions in a spiral pattern around the desired position
    let steps = 8; // Number of directions to try
    let stepSize = searchRadius / steps;
    
    for (let radius = stepSize; radius <= searchRadius; radius += stepSize) {
      for (let angle = 0; angle < TWO_PI; angle += TWO_PI / steps) {
        let testX = desiredX + cos(angle) * radius;
        let testY = desiredY + sin(angle) * radius;
        
        // Make sure it's within canvas bounds
        if (testX >= 0 && testX <= width && testY >= 0 && testY <= height) {
          if (!this.path.isTooCloseToPath(testX, testY, minDistance)) {
            return { x: testX, y: testY };
          }
        }
      }
    }
    
    return null; // No valid position found
  }

  startEnemyController() {
    this.enemyController.initialize();
  }

  startGame() {
    // Reset game state
    this.score = config.score;
    this.maxHealth = config.score;
    this.money = config.money;
    this.waveManager.reset();
    // Clear existing enemies
    this.enemyController.enemies = [];
    // Start first wave
    this.waveManager.startWave();
  }

  mouseClicked() {
    var found = false;
    for (let i = 0; i < this.turrets.length; i++) {
      let turret = this.turrets[i];
      
      // Check if Safe or Medic is ready to collect
      if ((turret instanceof Safe || turret instanceof Medic) && turret.mouseClicked()) {
        found = true;
        continue;
      }

      if (!found) {
        found = turret.selection();
      }
      else
        turret.select = false
    }
  }

  mousePlace() {
    if (!this.nextTurret) return;
    
    // Check if turret is too close to the path
    var minDistance = 60; // Minimum distance from path in pixels
    if (this.path.isTooCloseToPath(mouseX, mouseY, minDistance)) {
      // Show feedback that placement is invalid
      cursor(ARROW);
      return;
    }
    
    cursor(HAND)
    this.nextTurret.active = true;
    this.turrets.push(this.nextTurret);
    var target = this.money - this.nextTurret.price;
    createjs.Tween.get(this)
      .to({ money: target }, 250, createjs.Ease.getPowInOut(1))

    if (config.keepPlacingTurrets && target > this.nextTurret.price) {
      this.nextTurret = TurretBase.create(this.nextTurret.type, true, false);
    }
    else
      this.nextTurret = undefined;
  }

  keyTyped() {
    this.shop.keyTyped();
    this.turrets.map(t => t.keyTyped())
  }

  doubleClicked() {
    this.turrets.map(t => t.doubleClicked());
  }


  takeHit(damage) {
    this.score -= damage;
    this.score = max(0, this.score); // Don't go below 0
  }
  
  addHealth(amount) {
    this.score = min(this.score + amount, this.maxHealth);
  }
  
  increaseMaxHealth(amount) {
    this.maxHealth += amount;
    this.score += amount; // Also add to current health
  }

  gameOver() {
    return this.score <= 0;
  }

  drawInfo() {
    push()
    let s = config.scale || 1;
    
    // Health bar
    let barX = 30;
    let barY = 25;
    let barWidth = 200 * s;
    let barHeight = 30 * s;
    let healthPercent = Math.max(0, this.score / this.maxHealth);
    
    // Bar background
    fill(20, 25, 35);
    stroke(0, 100, 120);
    strokeWeight(2);
    rectMode(CORNER);
    rect(barX, barY, barWidth, barHeight, 6);
    
    // Health fill - gradient from green to yellow to red
    let healthColor;
    if (healthPercent > 0.6) {
      // Green to yellow
      let t = map(healthPercent, 0.6, 1, 0, 1);
      healthColor = lerpColor(color(220, 200, 50), color(50, 220, 100), t);
    } else if (healthPercent > 0.3) {
      // Yellow to orange
      let t = map(healthPercent, 0.3, 0.6, 0, 1);
      healthColor = lerpColor(color(255, 100, 50), color(220, 200, 50), t);
    } else {
      // Orange to red
      let t = map(healthPercent, 0, 0.3, 0, 1);
      healthColor = lerpColor(color(200, 30, 30), color(255, 100, 50), t);
    }
    
    noStroke();
    fill(healthColor);
    rect(barX + 3, barY + 3, (barWidth - 6) * healthPercent, barHeight - 6, 4);
    
    // Shine effect
    fill(255, 255, 255, 40);
    rect(barX + 3, barY + 3, (barWidth - 6) * healthPercent, (barHeight - 6) / 3, 4);
    
    // Health text on bar
    fill(255);
    noStroke();
    textSize(16 * s);
    textAlign(CENTER, CENTER);
    text(this.score + " HP", barX + barWidth / 2, barY + barHeight / 2);
    
    // Heart icon
    fill(healthColor);
    textSize(24 * s);
    text("♥", barX + barWidth + 20, barY + barHeight / 2);
    
    // Credits in gold/amber - moved to the right
    textAlign(LEFT, CENTER);
    fill(255, 200, 50);
    textSize(36 * s);
    text(floor(this.money) + " CR", barX + barWidth + 60, barY + barHeight / 2);
    pop()

  }

  drawWaveInfo() {
    push();
    let s = config.scale || 1;
    let waveInfo = this.waveManager.getWaveInfo();
    
    // Wave display - top right (avoid overlapping with credits on left)
    let waveX = width - 150 * s;
    textAlign(RIGHT, TOP);
    fill(0, 200, 255);
    textSize(28 * s);
    textStyle(BOLD);
    text("WAVE " + waveInfo.currentWave, waveX, 30);
    
    // Enemy count
    textSize(18 * s);
    textStyle(NORMAL);
    fill(200, 200, 200);
    text(`${waveInfo.enemiesAlive} / ${waveInfo.enemiesInWave}`, waveX, 70);
    
    // Wave break countdown (still centered for visibility)
    if (waveInfo.inWaveBreak) {
      let timeLeft = Math.ceil(waveInfo.waveBreakTimeRemaining / 1000);
      textSize(24 * s);
      fill(100, 255, 150);
      textAlign(CENTER, CENTER);
      text(`Next wave in ${timeLeft}...`, width / 2, height / 2 - 50);
    }
    
    pop();
  }

  draw() {
    this.path.draw();
    this.drawInfo();
    this.drawWaveInfo();
    this.turrets.map((turret) => turret.draw());
    // if there is a turret select for placement, draw it
    if (this.nextTurret) {
      this.nextTurret.x = mouseX;
      this.nextTurret.y = mouseY;
      
      // Check if placement is valid (not too close to path)
      var minDistance = 60;
      var isValidPlacement = !this.path.isTooCloseToPath(mouseX, mouseY, minDistance);
      
      // Temporarily disable range visualization if placement is invalid
      var originalSelect = this.nextTurret.select;
      if (!isValidPlacement) {
        this.nextTurret.select = false;
      }
      
      // Draw turret with visual feedback
      if (!isValidPlacement) {
        // Draw red overlay to show invalid placement
        push();
        translate(mouseX, mouseY);
        fill(255, 50, 50, 100);
        noStroke();
        ellipse(0, 0, 100, 100);
        pop();
      }
      
      // Draw turret (may be dimmed if invalid)
      push();
      if (!isValidPlacement) {
        drawingContext.globalAlpha = 0.5;
      }
      this.nextTurret.draw();
      drawingContext.globalAlpha = 1;
      pop();
      
      // Restore original select state
      this.nextTurret.select = originalSelect;
    }
    this.enemyController.draw();
    
    // Only draw shop during wave breaks or playing (not during menu/game over)
    const state = getGameState();
    if (state === GameState.PLAYING || state === GameState.WAVE_BREAK) {
      this.shop.draw();
    }

    if (config.showMousePosition) {
      push()
      fill(0, 150, 150);
      textSize(16);
      var mouseText = `⌖ (${Math.floor(mouseX)}, ${Math.floor(mouseY)})`
      text(mouseText, width - 200, 30);
      pop()
    }
  }
}

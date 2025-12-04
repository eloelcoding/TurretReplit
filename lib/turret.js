class Unit {
  constructor(x, y) {
    this.initial_damage = 2
    this._range = 150;
    this.angleToMob = 0;
    this.x = x;
    this.y = y;
    this.active = true;
    this.select = false;

    this.zoom = 1

    this.level = 1;
    this.maxLevel = 3;

  }

  // factory
  static create(type, showRange, active) {
    var turretType = {
      'turret': Turret,
      'cannon': Cannon,
      'twinGun': TwinGun,
      'safe': Safe,
    }[type];
    var turret = new turretType(0, 0);
    // turret.level = level;
    turret.select = showRange;
    turret.active = active;
    turret.type = type;
    return turret;
  }

  getCurrentSetting(type, interpolate) {
    var config = this.config()[type];
    if (interpolate) {
      var floor = Math.floor(this.level);
      var valueFloor = config[floor - 1];
      var valueCeil = config[floor];
      // if there is no more config, no point interpolating
      if (valueCeil == undefined)
        return valueFloor
      return valueFloor + (valueCeil - valueFloor) * (this.level % 1);
    }
    return config[this.level - 1];
  }
  upgrade() {
    if (this.level >= this.maxLevel) return;
    var upgradePrice = this.upgradePrice()
    if (game.money > upgradePrice) {
      game.money -= upgradePrice;
      this.active = false
      this.textBubble = new TextWidget("Upgrade", this.x - 100, this.y);
      this.textBubble.vanish(() => this.textBubble = undefined);
      this.twirl();
    }
  }
  upgradePrice() {
    return this.getCurrentSetting('upgradePrice')
  }
  mouseIsNear() {
    return dist(mouseX, mouseY, this.x, this.y) < 30;
  }

  selection() {
    if (this.mouseIsNear()) {
      this.select = !this.select //toggle
      return true;
    }
    else
      this.select = false
    return false;
  }

  doubleClicked() {
    if (this.mouseIsNear())
      this.upgrade()
  }


  upgradePossible() {
    return this.select && this.level < this.maxLevel;
  }

  keyTyped() {
    print(key);
    if (key === 'u' & this.upgradePossible())
      this.upgrade();
  }

  displayTurretImage() {
    // Draw turret programmatically with gradients
    this.drawFuturisticTurret();
  }

  // Override in subclasses for specific colors
  getTurretColors() {
    return {
      base: [60, 65, 80],
      baseHighlight: [90, 95, 110],
      ring: [100, 110, 130],
      core: [150, 160, 180],
      coreGlow: [200, 210, 230],
      accent: [100, 150, 200]
    };
  }

  drawFuturisticTurret() {
    let colors = this.getTurretColors();
    let size = 280; // Base size (will be scaled down by 0.2)
    let level = Math.floor(this.level);
    
    push();
    
    // Outer glow based on level
    if (level >= 2) {
      noStroke();
      for (let i = 3; i > 0; i--) {
        fill(colors.accent[0], colors.accent[1], colors.accent[2], 10 * i);
        ellipse(0, 0, size + 40 * i, size + 40 * i);
      }
    }
    
    // Hexagonal base with gradient effect
    this.drawGradientHexagon(0, 0, size * 0.85, colors.base, colors.baseHighlight);
    
    // Level 3: outer ring
    if (level >= 3) {
      noFill();
      stroke(colors.accent[0], colors.accent[1], colors.accent[2], 200);
      strokeWeight(4);
      ellipse(0, 0, size * 0.95, size * 0.95);
      
      // Dashed energy ring
      stroke(colors.accent[0], colors.accent[1], colors.accent[2], 150);
      strokeWeight(6);
      drawingContext.setLineDash([15, 10]);
      ellipse(0, 0, size * 0.88, size * 0.88);
      drawingContext.setLineDash([]);
    }
    
    // Inner ring
    stroke(colors.ring[0], colors.ring[1], colors.ring[2]);
    strokeWeight(4);
    fill(20, 25, 35);
    ellipse(0, 0, size * 0.65, size * 0.65);
    
    // Energy core with glow
    noStroke();
    // Outer glow
    for (let i = 4; i > 0; i--) {
      fill(colors.coreGlow[0], colors.coreGlow[1], colors.coreGlow[2], 30 * i);
      ellipse(0, 0, size * (0.35 + i * 0.05), size * (0.35 + i * 0.05));
    }
    // Core gradient
    this.drawGradientCircle(0, 0, size * 0.35, colors.core, colors.coreGlow);
    
    // Barrel
    let barrelLength = size * 0.5 + level * 15;
    let barrelWidth = size * 0.18;
    
    // Level 3 has triple barrel
    if (level >= 3) {
      this.drawBarrel(size * 0.25, -barrelWidth * 0.7, barrelLength, barrelWidth * 0.5, colors);
      this.drawBarrel(size * 0.25, 0, barrelLength, barrelWidth * 0.5, colors);
      this.drawBarrel(size * 0.25, barrelWidth * 0.7, barrelLength, barrelWidth * 0.5, colors);
    } else {
      this.drawBarrel(size * 0.25, 0, barrelLength, barrelWidth, colors);
    }
    
    // Level 2+: side vents
    if (level >= 2) {
      fill(colors.accent[0], colors.accent[1], colors.accent[2], 150);
      noStroke();
      rect(-size * 0.48, -size * 0.05, size * 0.08, size * 0.1, 2);
    }
    
    pop();
  }

  drawGradientHexagon(cx, cy, size, colorDark, colorLight) {
    push();
    translate(cx, cy);
    
    // Draw filled hexagon with gradient simulation
    let points = 6;
    for (let layer = 0; layer < 5; layer++) {
      let t = layer / 4;
      let r = map(layer, 0, 4, size * 0.5, size * 0.45);
      let col = [
        lerp(colorDark[0], colorLight[0], t),
        lerp(colorDark[1], colorLight[1], t),
        lerp(colorDark[2], colorLight[2], t)
      ];
      
      fill(col[0], col[1], col[2]);
      stroke(col[0] * 0.7, col[1] * 0.7, col[2] * 0.7);
      strokeWeight(2);
      
      beginShape();
      for (let i = 0; i < points; i++) {
        let angle = TWO_PI / points * i - PI / 2;
        let x = cos(angle) * r;
        let y = sin(angle) * r;
        vertex(x, y);
      }
      endShape(CLOSE);
    }
    
    // Highlight edge
    noFill();
    stroke(colorLight[0] + 30, colorLight[1] + 30, colorLight[2] + 30, 100);
    strokeWeight(2);
    beginShape();
    for (let i = 0; i < points; i++) {
      let angle = TWO_PI / points * i - PI / 2;
      let x = cos(angle) * size * 0.5;
      let y = sin(angle) * size * 0.5;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    pop();
  }

  drawGradientCircle(cx, cy, size, colorInner, colorOuter) {
    push();
    noStroke();
    for (let r = size; r > 0; r -= 3) {
      let t = 1 - r / size;
      let col = [
        lerp(colorOuter[0], colorInner[0], t),
        lerp(colorOuter[1], colorInner[1], t),
        lerp(colorOuter[2], colorInner[2], t)
      ];
      fill(col[0], col[1], col[2]);
      ellipse(cx, cy, r, r);
    }
    // Bright center
    fill(255, 255, 255, 200);
    ellipse(cx, cy, size * 0.3, size * 0.3);
    pop();
  }

  drawBarrel(x, y, length, width, colors) {
    push();
    rectMode(CORNER);
    
    // Barrel body with gradient
    for (let i = 0; i < 5; i++) {
      let t = i / 4;
      let col = [
        lerp(colors.base[0], colors.baseHighlight[0], t),
        lerp(colors.base[1], colors.baseHighlight[1], t),
        lerp(colors.base[2], colors.baseHighlight[2], t)
      ];
      fill(col[0], col[1], col[2]);
      stroke(col[0] * 0.7, col[1] * 0.7, col[2] * 0.7);
      strokeWeight(1);
      let yOffset = map(i, 0, 4, -width/2, -width/2 + width * 0.1);
      let h = map(i, 0, 4, width, width * 0.8);
      rect(x, y + yOffset, length, h, 3);
    }
    
    // Barrel tip glow
    noStroke();
    fill(colors.accent[0], colors.accent[1], colors.accent[2], 220);
    rect(x + length - 15, y - width * 0.35, 12, width * 0.7, 2);
    
    pop();
  }

  range() {
    // Scale range with global scale factor
    return this.getCurrentSetting('range', true) * (config.scale || 1);
  }


  draw(disabled) {
    push();
    translate(this.x, this.y); // Move the image to the center of rotation
    if (this.select) {
      push();
      // Futuristic cyan range indicator
      fill(0, 180, 200, 60);
      stroke(0, 220, 255, 100);
      strokeWeight(2);
      circle(0, 0, this.range() * 2);
      pop();
    }

    push()
    rotate(this.angleToMob); // Rotate the turret to face the mob
    scale(this.zoom) //tween
    addShadows()
    push()
    scale(0.2 * (config.scale || 1));  // Scale with global factor
    if (disabled)
      tint(255, 50);

    this.displayTurretImage()
    pop()
    pop()
    pop()
  }
}

class TurretBase extends Unit {
  constructor(x, y) {
    super(x, y)
    this.firing = false;
    this.updateShootingSpeed();
  }

  updateShootingSpeed() {
    var shootInterval = this.getCurrentSetting("interval")
    clearInterval(this._interval)
    this._interval = setInterval(() => { this.shoots() }, shootInterval);
  }

  twirl() {
    var originalAngle = this.angleToMob;
    createjs.Tween.get(this)
      .to({ level: this.level + 1, angleToMob: originalAngle + PI * 6 }, 1500, createjs.Ease.getPowInOut(3))
      // .to({ angleToMob: this.angleToMob + PI * 4 }, 100, createjs.Ease.getPowInOut(1))
      .call(() => {
        this.angleToMob = originalAngle;
        createjs.Tween.get(this)
          .to({ angleToMob: this.getAngleToMob() + PI * 6 }, 100, createjs.Ease.getPowInOut(1))
          .call(() => {
            this.active = true; this.updateShootingSpeed()
          })
      });
  }

  damage() {
    return this.getCurrentSetting('damage')
  }

  shoots() {
    // Check if game exists (turret might be in shop preview)
    if (typeof game === 'undefined' || !game.enemyController) {
      return;
    }
    
    if (!this.active) {
      return;
    }
    
    var range = this.range();
    var target = game.enemyController.targetEnemy(this.x, this.y, range);
    if (!target) {
      return;
    }

    // Play firing sound effect
    config.playSound(this.getFiringSound());
    
    // Create projectile instead of instant damage
    let projectileColor = this.getProjectileColor();
    effectsManager.addProjectile(this.x, this.y, target, this.damage(), 10, projectileColor);
    
    this.firing = true;

    createjs.Tween.get(this)
      .to({ zoom: 1.1 }, 50, createjs.Ease.getPowInOut(1))
      .to({ zoom: 0.8 }, 100, createjs.Ease.getPowInOut(1))
      .to({ zoom: 1 }, 100, createjs.Ease.getPowInOut(1))

    setTimeout(() => { this.firing = false }, 100)
  }

  getProjectileColor() {
    return [0, 255, 255]; // Cyan plasma
  }

  getFiringSound() {
    return "laser"; // Default firing sound
  }

  getAngleToMob() {
    var enemyToShoot = game.enemyController.targetEnemy(this.x, this.y, this.range());
    if (enemyToShoot) {
      let dx = enemyToShoot.x - this.x;
      let dy = enemyToShoot.y - this.y;
      var smoothing = 0.8;

      return smoothing * this.angleToMob + (1 - smoothing) * atan2(dy, dx);
    }
    return this.angleToMob;
  }

  draw(disabled) { //draw starts here -------------------
    if (this.active)
      this.angleToMob = this.getAngleToMob();

    super.draw(disabled);

    if (this.firing) {
      push();
      translate(this.x, this.y); // Move the image to the center of rotation
      var fX = cos(this.angleToMob) * 28;
      var fY = sin(this.angleToMob) * 28;
      translate(fX, fY);
      rotate(this.angleToMob + PI / 2);
      translate(-3, -6)

      this.firingImg()
      pop();
    }

    if (this.textBubble)
      this.textBubble.draw();
  }

}


class Turret extends TurretBase {
  constructor(x, y, z) {
    super(x, y)
    this.z = z
    this.price = 40;
    // Re-initialize shooting speed to ensure Turret's config is used
    this.updateShootingSpeed();
  }

  config() {
    return {
      interval: [500, 450, 400],
      damage: [1, 2, 3],
      range: [120, 170, 220],  // Base ranges (will be scaled)
      imageMap: "turretMap",
      upgradePrice: [40, 80]
    }
  }
  
  getTurretColors() {
    return {
      base: [45, 55, 70],
      baseHighlight: [70, 85, 105],
      ring: [0, 150, 180],
      core: [0, 180, 200],
      coreGlow: [0, 255, 255],
      accent: [0, 220, 255]
    };
  }
  
  firingImg() {
    // Draw energy burst
    push();
    noStroke();
    fill(0, 255, 255, 150);
    ellipse(0, 0, 40, 30);
    fill(255, 255, 255, 200);
    ellipse(0, 0, 20, 15);
    pop();
  }
  getProjectileColor() {
    return [0, 255, 255]; // Cyan plasma
  }
}
class TwinGun extends TurretBase {
  constructor(x, y, z) {
    super(x, y)
    this.z = z
    this.price = 60;
    // Re-initialize shooting speed to ensure TwinGun's config is used
    this.updateShootingSpeed();
  }

  config() {
    return {
      interval: [300, 250, 200],
      damage: [1, 2, 3],
      range: [110, 150, 190],  // Base ranges (will be scaled)
      imageMap: "twinGunMap",
      upgradePrice: [60, 120]
    }
  }
  
  getTurretColors() {
    return {
      base: [55, 40, 65],
      baseHighlight: [85, 60, 100],
      ring: [180, 50, 150],
      core: [220, 80, 180],
      coreGlow: [255, 100, 220],
      accent: [255, 0, 180]
    };
  }
  
  firingImg() {
    // Draw dual energy bursts
    push();
    noStroke();
    fill(255, 0, 180, 150);
    ellipse(-15, 0, 30, 22);
    ellipse(15, 0, 30, 22);
    fill(255, 150, 220, 200);
    ellipse(-15, 0, 15, 10);
    ellipse(15, 0, 15, 10);
    pop();
  }
  getProjectileColor() {
    return [255, 0, 128]; // Magenta plasma
  }
}

class Cannon extends TurretBase {
  constructor(x, y, z) {
    super(x, y)
    this.z = z
    this.price = 80;
    // Re-initialize shooting speed to ensure Cannon's config is used
    this.updateShootingSpeed();
  }

  config() {
    return {
      interval: [600, 550, 500],  // Faster shooting
      damage: [4, 5, 6],
      range: [200, 260, 320],  // Much longer range for cannon
      imageMap: "cannonMap",
      upgradePrice: [80, 160]
    }
  }
  
  getTurretColors() {
    return {
      base: [60, 45, 35],
      baseHighlight: [100, 75, 55],
      ring: [200, 100, 0],
      core: [255, 150, 50],
      coreGlow: [255, 200, 100],
      accent: [255, 140, 0]
    };
  }
  
  firingImg() {
    // Draw fire burst
    push();
    noStroke();
    fill(255, 150, 0, 180);
    ellipse(0, 0, 60, 40);
    fill(255, 220, 100, 200);
    ellipse(0, 0, 35, 25);
    fill(255, 255, 200, 220);
    ellipse(0, 0, 15, 10);
    pop();
  }
  getProjectileColor() {
    return [255, 200, 50]; // Orange/Yellow
  }
  
  getFiringSound() {
    return "canon"; // Cannon uses the canon boom sound
  }
}

class Safe extends Unit {
  constructor(x, y, z) {
    super(x, y)
    this.z = z
    this.price = 80;
    this.amount = 0;

    this.updatePayRate();
  }

  deposit() {
    this.amount += this.getCurrentSetting("payment");
    var limit = this.getCurrentSetting("limit");
    if (this.amount >= limit)
      this.amount = limit;
  }
  updatePayRate() {
    var payInterval = this.getCurrentSetting("interval")
    clearInterval(this._interval)
    this._interval = setInterval(() => { this.deposit() }, payInterval);
  }
  collect() {
    game.money += this.amount;
    this.amount = 0
  }

  upgrade() {
    if (this.level >= this.maxLevel) return;
    var upgradePrice = this.upgradePrice()
    if (game.money > upgradePrice) {
      game.money -= upgradePrice;
      this.active = false
      this.textBubble = new TextWidget("Upgrade", this.x - 100, this.y);
      this.textBubble.vanish(() => this.textBubble = undefined);
      
      // Safe uses a pulse animation instead of twirl
      var originalZoom = this.zoom;
      createjs.Tween.get(this)
        .to({ level: this.level + 1, zoom: 1.3 }, 300, createjs.Ease.getPowInOut(2))
        .to({ zoom: 0.9 }, 200, createjs.Ease.getPowInOut(2))
        .to({ zoom: 1 }, 200, createjs.Ease.getPowInOut(2))
        .call(() => {
          this.active = true;
          this.updatePayRate();
        });
    }
  }

  config() {
    return {
      interval: [1000, 800, 600], //pay Rate
      payment: [10, 20, 30],
      limit: [100, 200, 300],
      imageMap: "safeMap",
      upgradePrice: [80, 160],
      range: [125, 125, 100],
    }
  }
  
  getTurretColors() {
    return {
      base: [40, 35, 25],
      baseHighlight: [70, 60, 40],
      ring: [200, 170, 50],
      core: [255, 200, 50],
      coreGlow: [255, 230, 100],
      accent: [255, 200, 0]
    };
  }

  // Override to draw money generator instead of turret
  displayTurretImage() {
    this.drawMoneyGenerator();
  }

  drawMoneyGenerator() {
    let size = 280;
    let level = Math.floor(this.level);
    let colors = this.getTurretColors();
    
    push();
    
    // Outer glow - golden
    noStroke();
    for (let i = 4; i > 0; i--) {
      fill(255, 200, 50, 8 * i);
      ellipse(0, 0, size + 30 * i, size + 30 * i);
    }
    
    // Base platform - octagonal
    this.drawOctagon(0, 0, size * 0.5, [40, 45, 55], [60, 65, 75]);
    
    // Vault body - rectangular with rounded corners
    fill(50, 55, 65);
    stroke(80, 85, 95);
    strokeWeight(4);
    rectMode(CENTER);
    rect(0, 0, size * 0.65, size * 0.55, 15);
    
    // Inner vault door
    fill(35, 40, 50);
    stroke(100, 90, 60);
    strokeWeight(3);
    rect(0, 0, size * 0.55, size * 0.45, 10);
    
    // Vault door details - horizontal lines
    stroke(70, 75, 85);
    strokeWeight(2);
    for (let i = -2; i <= 2; i++) {
      line(-size * 0.2, i * 18, size * 0.2, i * 18);
    }
    
    // Credit display screen
    fill(10, 30, 25);
    stroke(0, 200, 150);
    strokeWeight(2);
    rect(0, -size * 0.08, size * 0.35, size * 0.18, 5);
    
    // Screen glow
    fill(0, 255, 200, 50);
    noStroke();
    rect(0, -size * 0.08, size * 0.33, size * 0.16, 4);
    
    // Credit symbol on screen
    fill(0, 255, 200);
    textAlign(CENTER, CENTER);
    textSize(36);
    text("CR", 0, -size * 0.08);
    
    // Coin slot
    fill(20, 20, 25);
    stroke(200, 170, 50);
    strokeWeight(2);
    rect(0, size * 0.12, size * 0.15, size * 0.04, 2);
    
    // Level indicators - golden bars
    let barY = size * 0.19;
    for (let i = 0; i < level; i++) {
      fill(255, 200, 50);
      noStroke();
      rect(-size * 0.12 + i * size * 0.12, barY, size * 0.08, size * 0.025, 2);
    }
    
    // Corner accents - golden
    stroke(255, 200, 50);
    strokeWeight(3);
    noFill();
    // Top left
    line(-size * 0.3, -size * 0.22, -size * 0.3, -size * 0.18);
    line(-size * 0.3, -size * 0.22, -size * 0.26, -size * 0.22);
    // Top right
    line(size * 0.3, -size * 0.22, size * 0.3, -size * 0.18);
    line(size * 0.3, -size * 0.22, size * 0.26, -size * 0.22);
    // Bottom left
    line(-size * 0.3, size * 0.22, -size * 0.3, size * 0.18);
    line(-size * 0.3, size * 0.22, -size * 0.26, size * 0.22);
    // Bottom right
    line(size * 0.3, size * 0.22, size * 0.3, size * 0.18);
    line(size * 0.3, size * 0.22, size * 0.26, size * 0.22);
    
    // Animated floating coins (based on amount stored)
    if (this.amount > 0) {
      let coinCount = min(floor(this.amount / 20), 5);
      for (let i = 0; i < coinCount; i++) {
        let angle = (frameCount * 0.02 + i * TWO_PI / coinCount);
        let coinX = cos(angle) * size * 0.35;
        let coinY = -size * 0.35 + sin(frameCount * 0.05 + i) * 10;
        
        // Coin glow
        fill(255, 200, 50, 100);
        noStroke();
        ellipse(coinX, coinY, 25, 25);
        
        // Coin
        fill(255, 200, 50);
        stroke(200, 150, 0);
        strokeWeight(2);
        ellipse(coinX, coinY, 18, 18);
        
        // Coin shine
        fill(255, 255, 200);
        noStroke();
        ellipse(coinX - 3, coinY - 3, 5, 5);
      }
    }
    
    // Holographic credit amount display (when selected or has money)
    if (this.amount > 0) {
      // Hologram effect
      fill(0, 255, 200, 150 + sin(frameCount * 0.1) * 50);
      textSize(28);
      textAlign(CENTER, CENTER);
      text(this.amount, 0, -size * 0.4);
      
      // Hologram glow
      fill(0, 255, 200, 30);
      noStroke();
      ellipse(0, -size * 0.4, 60, 30);
    }
    
    pop();
  }

  drawOctagon(cx, cy, size, colorDark, colorLight) {
    push();
    translate(cx, cy);
    
    let points = 8;
    fill(colorDark[0], colorDark[1], colorDark[2]);
    stroke(colorLight[0], colorLight[1], colorLight[2]);
    strokeWeight(2);
    
    beginShape();
    for (let i = 0; i < points; i++) {
      let angle = TWO_PI / points * i - PI / 8;
      let x = cos(angle) * size;
      let y = sin(angle) * size;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    pop();
  }
  
  draw(disabled) {
    super.draw(disabled);
    
    if (!this.select) {
      if (this.button) {
        this.button.remove();
        delete this.button;
      }
      return;
    } 

    push();
    translate(this.x - 20, this.y + 10);
    fill(0, 255, 200);
    textSize(20)
    textAlign(CENTER)
    text(this.amount, 0, 0);
    pop();

    if (!this.button) {
      this.button = createButton("Collect " + this.amount);
      this.button.position(200, height + 10);
      this.button.size(150, 50);
      this.button.mousePressed(() => this.collect())
    }
  }
}

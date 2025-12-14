// Medic - like Safe but generates health instead of money
class Medic extends Unit {
  constructor(x, y, z) {
    super(x, y)
    this.z = z
    this.price = config.prices.medic;
    this.amount = 0;
    
    // State: 'accumulating', 'ready', 'cooldown'
    this.state = 'accumulating';
    this.readyWindowTime = 5000; // 5 seconds to click when full
    this.readyWindowStart = 0;
    this.cooldownTime = 3000; // 3 seconds break after collection
    this.cooldownStart = 0;

    this.startAccumulating();
  }

  range() {
    // Medic doesn't shoot, so return very small range (essentially invisible)
    return 1;
  }

  deposit() {
    if (this.state !== 'accumulating') return;
    
    this.amount += this.getCurrentSetting("payment");
    var limit = this.getCurrentSetting("limit");
    if (this.amount >= limit) {
      this.amount = limit;
      this.startReadyWindow();
    }
  }
  
  startAccumulating() {
    this.state = 'accumulating';
    this.amount = 0;
    this.updatePayRate();
  }
  
  startReadyWindow() {
    this.state = 'ready';
    this.readyWindowStart = millis();
    // Stop accumulating
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }
  
  startCooldown() {
    this.state = 'cooldown';
    this.cooldownStart = millis();
    this.amount = 0;
  }
  
  updatePayRate() {
    var payInterval = this.getCurrentSetting("interval")
    if (this._interval) {
      clearInterval(this._interval);
    }
    this._interval = setInterval(() => { this.deposit() }, payInterval);
  }
  
  update() {
    if (this.state === 'ready') {
      // Check if ready window expired
      if (millis() - this.readyWindowStart >= this.readyWindowTime) {
        // Window expired, start cooldown
        this.startCooldown();
      }
    } else if (this.state === 'cooldown') {
      // Check if cooldown is over
      if (millis() - this.cooldownStart >= this.cooldownTime) {
        // Cooldown over, start accumulating again
        this.startAccumulating();
      }
    }
  }
  
  collect() {
    if (this.state === 'ready') {
      // Add health (but don't exceed max)
      game.score = min(game.score + this.amount, game.maxHealth);
      this.startCooldown();
    }
  }
  
  mouseClicked() {
    if (this.state === 'ready' && this.mouseIsNear()) {
      this.collect();
      return true;
    }
    return false;
  }

  upgrade() {
    if (this.level >= this.maxLevel) return;
    var upgradePrice = this.upgradePrice()
    if (game.money > upgradePrice) {
      game.money -= upgradePrice;
      this.active = false
      this.textBubble = new TextWidget("Upgrade", this.x - 100, this.y);
      this.textBubble.vanish(() => this.textBubble = undefined);
      
      var originalZoom = this.zoom;
      createjs.Tween.get(this)
        .to({ level: this.level + 1, zoom: 1.3 }, 300, createjs.Ease.getPowInOut(2))
        .to({ zoom: 0.9 }, 200, createjs.Ease.getPowInOut(2))
        .to({ zoom: 1 }, 200, createjs.Ease.getPowInOut(2))
        .call(() => {
          this.active = true;
          this.startAccumulating();
        });
    }
  }

  config() {
    return {
      interval: [1500, 1200, 1000], // Health generation rate (slower than money)
      payment: [15, 25, 35], // Health per deposit
      limit: [50, 100, 150], // Max health stored
      imageMap: "safeMap",
      upgradePrice: config.prices.upgrades.medic,
      range: [125, 125, 100],
    }
  }
  
  getTurretColors() {
    return {
      base: [25, 40, 35],
      baseHighlight: [40, 70, 60],
      ring: [100, 200, 150],
      core: [150, 255, 200],
      coreGlow: [180, 255, 220],
      accent: [100, 255, 150]
    };
  }

  displayTurretImage() {
    this.drawMedicStation();
  }

  drawMedicStation() {
    let size = 280;
    let level = Math.floor(this.level);
    let colors = this.getTurretColors();
    
    push();
    
    // Outer glow - green/cyan
    noStroke();
    for (let i = 4; i > 0; i--) {
      fill(100, 255, 150, 8 * i);
      ellipse(0, 0, size + 30 * i, size + 30 * i);
    }
    
    // Base platform
    this.drawOctagon(0, 0, size * 0.5, [30, 40, 50], [50, 60, 70]);
    
    // Medical station body
    fill(40, 60, 55);
    stroke(80, 120, 100);
    strokeWeight(4);
    rectMode(CENTER);
    rect(0, 0, size * 0.65, size * 0.55, 15);
    
    // Inner panel
    fill(30, 50, 45);
    stroke(100, 200, 150);
    strokeWeight(3);
    rect(0, 0, size * 0.55, size * 0.45, 10);
    
    // Medical cross symbol
    stroke(150, 255, 200);
    strokeWeight(6);
    line(0, -size * 0.15, 0, size * 0.15);
    line(-size * 0.15, 0, size * 0.15, 0);
    
    // Health display screen
    fill(10, 30, 20);
    stroke(100, 255, 150);
    strokeWeight(2);
    rect(0, -size * 0.08, size * 0.35, size * 0.18, 5);
    
    // Screen glow
    fill(100, 255, 150, 50);
    noStroke();
    rect(0, -size * 0.08, size * 0.33, size * 0.16, 4);
    
    // HP symbol on screen
    fill(100, 255, 150);
    textAlign(CENTER, CENTER);
    textSize(36);
    text("HP", 0, -size * 0.08);
    
    // Level indicators - green bars
    let barY = size * 0.19;
    for (let i = 0; i < level; i++) {
      fill(100, 255, 150);
      noStroke();
      rect(-size * 0.12 + i * size * 0.12, barY, size * 0.08, size * 0.025, 2);
    }
    
    // State-based visual feedback
    if (this.state === 'ready') {
      // Pulsing glow when ready to collect
      let pulseAlpha = 100 + sin(frameCount * 0.2) * 100;
      fill(100, 255, 150, pulseAlpha);
      noStroke();
      ellipse(0, 0, size * 1.2, size * 1.2);
      
      // Flashy border
      stroke(100, 255, 150, 200);
      strokeWeight(4);
      noFill();
      rect(0, 0, size * 0.7, size * 0.6, 15);
      
      // Time remaining indicator
      let timeLeft = Math.ceil((this.readyWindowTime - (millis() - this.readyWindowStart)) / 1000);
      fill(255, 255, 255);
      textSize(20);
      textAlign(CENTER);
      text("CLICK!", 0, -size * 0.35);
      textSize(16);
      fill(200, 255, 200);
      text(timeLeft + "s", 0, -size * 0.25);
    } else if (this.state === 'cooldown') {
      // Dimmed appearance during cooldown
      drawingContext.globalAlpha = 0.5;
      
      // Cooldown progress indicator
      let cooldownProgress = (millis() - this.cooldownStart) / this.cooldownTime;
      fill(100, 100, 100, 150);
      noStroke();
      rect(0, size * 0.3, size * 0.6 * cooldownProgress, 8, 4);
      
      drawingContext.globalAlpha = 1;
    }
    
    // Health amount display (when accumulating or ready)
    if (this.amount > 0 && (this.state === 'accumulating' || this.state === 'ready')) {
      // Hologram effect
      fill(100, 255, 150, 150 + sin(frameCount * 0.1) * 50);
      textSize(28);
      textAlign(CENTER, CENTER);
      text(this.amount, 0, -size * 0.4);
      
      // Hologram glow
      fill(100, 255, 150, 30);
      noStroke();
      ellipse(0, -size * 0.4, 60, 30);
    }
    
    pop();
  }
  
  drawOctagon(cx, cy, size, colorDark, colorLight) {
    push();
    translate(cx, cy);
    
    // Draw octagon with gradient effect
    noStroke();
    beginShape();
    for (let i = 0; i < 8; i++) {
      let angle = (TWO_PI / 8) * i - PI / 8;
      let x = cos(angle) * size;
      let y = sin(angle) * size;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    // Dark base
    fill(colorDark[0], colorDark[1], colorDark[2]);
    beginShape();
    for (let i = 0; i < 8; i++) {
      let angle = (TWO_PI / 8) * i - PI / 8;
      let x = cos(angle) * size;
      let y = sin(angle) * size;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    // Light highlight on top edges
    stroke(colorLight[0], colorLight[1], colorLight[2]);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i < 5; i++) {  // Top half
      let angle = (TWO_PI / 8) * i - PI / 8;
      let x = cos(angle) * size;
      let y = sin(angle) * size;
      vertex(x, y);
    }
    endShape();
    
    pop();
  }
  
  draw() {
    if (!this.active) return;
    
    // Update state machine
    this.update();
    
    push();
    translate(this.x, this.y);
    scale(this.zoom);
    
    if (this.select) {
      this.drawRange();
    }
    
    this.displayTurretImage();
    
    if (this.textBubble) {
      this.textBubble.draw();
    }
    
    pop();
  }
}


class Game {
  constructor(path) {
    this.score = config.score;
    this.money = config.money;
    
    // Get turret positions from current map config
    let s = config.scale || 1;
    let mapConfig = config.maps[config.currentMap];
    
    this.turrets = [];
    if (mapConfig && mapConfig.turrets) {
      mapConfig.turrets.forEach(t => {
        let TurretClass = { turret: Turret, cannon: Cannon, safe: Safe, twinGun: TwinGun }[t.type];
        if (TurretClass) {
          this.turrets.push(new TurretClass(t.x * s, t.y * s));
        }
      });
    } else {
      // Fallback positions
      this.turrets = [
        new Turret(200 * s, 300 * s),
        new Safe(400 * s, 350 * s)
      ];
    }
    
    this.path = path;
    this.shop = new Shop(true);
    this.enemyController = new EnemyController(path);
  }

  startEnemyController() {
    this.enemyController.initialize();
  }

  mouseClicked() {
    var found = false;
    for (let i = 0; i < this.turrets.length; i++) {
      let turret = this.turrets[i];

      if (!found) {
        found = turret.selection();
      }
      else
        turret.select = false
    }
  }

  mousePlace() {
    if (!this.nextTurret) return;
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
    let maxHealth = config.score;  // Starting health
    let healthPercent = Math.max(0, this.score / maxHealth);
    
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

  draw() {
    this.path.draw();
    this.drawInfo();
    this.turrets.map((turret) => turret.draw());
    // if there is a turret select for placement, draw it
    if (this.nextTurret) {
      this.nextTurret.x = mouseX;
      this.nextTurret.y = mouseY;
      this.nextTurret.draw();
    }
    this.enemyController.draw();
    this.shop.draw();

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

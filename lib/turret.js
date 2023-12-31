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
    if (this.level % 1 != 0) {
      var levelFloor = Math.floor(this.level)
      image(config.getImageMap(this.config().imageMap, levelFloor - 1), 0, 0);
      push()
      tint(255, 255 * (this.level % 1))
      image(config.getImageMap(this.config().imageMap, levelFloor), 0, 0);
      pop();
    }
    else
      image(config.getImageMap(this.config().imageMap, this.level - 1), 0, 0)
  }

  range() {
    return this.getCurrentSetting('range', true);
  }


  draw(disabled) {
    push();
    translate(this.x, this.y); // Move the image to the center of rotation
    if (this.select) {
      push();
      fill(100, 100, 200, 100);
      noStroke();
      circle(0, 0, this.range() * 2);
      pop();
    }

    push()
    rotate(this.angleToMob); // Rotate the turret to face the mob
    scale(this.zoom) //tween
    addShadows()
    push()
    scale(0.2);
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
    if (!this.active) return;
    var target = game.enemyController.targetEnemy(this.x, this.y, this.range());
    if (!target) return;

    // config.playSound("canon")
    target.hit(this.damage());
    this.firing = true;

    createjs.Tween.get(this)
      .to({ zoom: 1.1 }, 50, createjs.Ease.getPowInOut(1))
      .to({ zoom: 0.8 }, 100, createjs.Ease.getPowInOut(1))
      .to({ zoom: 1 }, 100, createjs.Ease.getPowInOut(1))

    setTimeout(() => { this.firing = false }, 100)
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
  }

  config() {
    return {
      interval: [500, 450, 400],
      damage: [1, 2, 3],
      range: [100, 150, 200],
      imageMap: "turretMap",
      upgradePrice: [40, 80]
    }
  }
  firingImg() {
    image(config.getImage("fire"), 0, 0, 80, 60)
  }
}
class TwinGun extends TurretBase {
  constructor(x, y, z) {
    super(x, y)
    this.z = z
    this.price = 60;
  }

  config() {
    return {
      interval: [300, 250, 200],
      damage: [1, 2, 3],
      range: [90, 130, 170],
      imageMap: "twinGunMap",
      upgradePrice: [60, 120]
    }
  }
  firingImg() {
    image(config.getImage("fire"), -13, 0, 60, 40)
    image(config.getImage("fire"), 13, 0, 60, 40)
  }
}

class Cannon extends TurretBase {
  constructor(x, y, z) {
    super(x, y)
    this.z = z
    this.price = 80;
  }

  config() {
    return {
      interval: [800, 750, 700],
      damage: [3, 4, 5],
      range: [125, 175, 225],
      imageMap: "cannonMap",
      upgradePrice: [80, 160]
    }
  }
  firingImg() {
    image(config.getImage("fire"), 0, 0, 180, 60)
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
    translate(this.x - 20, this.y + 10); // Move the image to the center of rotation
    fill(0xffffff)
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

class TurretBase {
  constructor(x, y) {
    this.initial_damage = 2
    this._range = 150;
    this.angleToMob = 0;
    this.x = x;
    this.y = y;
    this.active = true;
    this.firing = false;
    this.select = false;

    this.zoom = 1

    this.level = 1;
    this.maxLevel = 3;
    this.updateShootingSpeed();
  }

  // factory
  static createTurret(type, showRange, active) {
    var turretType = {
      'turret': Turret,
      'cannon': Cannon,
      'twinGun': TwinGun,
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
      return valueFloor + (valueCeil - valueFloor) * (this.level % 1);
    }
    return config[this.level - 1];
  }

  updateShootingSpeed() {
    var shootInterval = this.getCurrentSetting("interval")
    clearInterval(this._interval)
    this._interval = setInterval(() => { this.shoots() }, shootInterval);
  }

  upgrade() {
    if (this.level >= this.maxLevel) return;
    var upgradePrice = this.upgradePrice()
    if (game.money > upgradePrice) {
      game.money -= upgradePrice;
      this.active = false
      createjs.Tween.get(this)
        .to({ level: this.level + 1, angleToMob: this.angleToMob + PI * 10 }, 2500, createjs.Ease.getPowInOut(3))
        .call(() => { this.active = true; this.updateShootingSpeed() });
    }
  }
  upgradePrice() {
    return this.getCurrentSetting('upgradePrice')
  }

  damage() {
    return this.getCurrentSetting('damage')
  }

  turretPic() {
    return this.getCurrentSetting('turretPic')
  }

  range() {
    return this.getCurrentSetting('range', true);
  }

  targetEnemy() {
    var enemiesAliveAndNear = enemies.filter((enemy) => enemy.alive);
    var range = this.range();
    enemiesAliveAndNear = enemiesAliveAndNear.filter((enemy) => {
      var distance = dist(this.x, this.y, enemy.x, enemy.y);
      return distance < range;
    })

    if (enemiesAliveAndNear.length == 0) return; //most advanced enemy
    // sort enemies based on their positionOnTrack
    enemiesAliveAndNear.sort((e1, e2) => e2.positionOnTrack - e1.positionOnTrack);
    var enemyToShoot = enemiesAliveAndNear[0];
    return enemyToShoot;
  }

  selection() {
    if (dist(mouseX, mouseY, this.x, this.y) < 30) {
      this.select = !this.select //toggle
      return true;
    }
    else
      this.select = false
    return false;
  }

  shoots() {
    if (!this.active) return;
    var target = this.targetEnemy();
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

  upgradePossible() {
    return this.select && this.level < this.maxLevel;
  }

  keyTyped() {
    print(key);
    if (key === 'u' & this.upgradePossible())
      this.upgrade();
    // this.throttledUpgrade()
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

  draw(disabled) {
    var enemyToShoot = this.targetEnemy();
    if (enemyToShoot && this.active) {
      let dx = enemyToShoot.x - this.x;
      let dy = enemyToShoot.y - this.y;
      this.angleToMob = atan2(dy, dx);
    }
    push();
    translate(this.x, this.y); // Move the image to the center of rotation
    if (this.select) {
      push();
      fill(100, 100, 200, 100);
      noStroke();
      circle(0, 0, this.range() * 2);
      pop();
      if (!this.button && this.upgradePossible()) {
        print("Creating button")
        this.button = createButton("Upgrade= " + this.upgradePrice());
        this.button.position(310, height + 10);
        this.button.size(150, 50);
        this.button.mousePressed(() => this.upgrade())
      }
    } else {
      if (this.button) {
        this.button.remove();
        delete this.button;
      }
    }
    // if (this.button) {
    //   this.keyPressed()
    // }

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

    if (this.firing) {
      push();
      var fX = cos(this.angleToMob) * 28;
      var fY = sin(this.angleToMob) * 28;
      translate(fX, fY);
      rotate(this.angleToMob + PI / 2);
      translate(-3, -6)

      this.firingImg()
      pop();
    }
    pop();
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
    image(config.imageFiles.fire, 0, 0, 80, 60)
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
    image(config.imageFiles.fire, -13, 0, 60, 40)
    image(config.imageFiles.fire, 13, 0, 60, 40)
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
    image(config.imageFiles.fire, 0, 0, 180, 60)
  }
}

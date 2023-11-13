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

    this.upgradePrice = 20;
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
    return turret;
  }

  getCurrentSetting(type) {
    return this.config()[type][this.level - 1]
  }

  updateShootingSpeed() {
    var shootInterval = this.getCurrentSetting("interval")
    clearInterval(this._interval)
    this._interval = setInterval(() => { this.shoots() }, shootInterval);
  }

  upgrade() {
    if (this.level >= this.maxLevel) return;
    if (game.money > this.upgradePrice) {
      game.money -= this.upgradePrice;
      this.level++;
      this.updateShootingSpeed();
      this.upgradePrice *= 2
    }
  }

  damage() {
    return this.getCurrentSetting('damage')
  }

  turretPic() {
    return this.getCurrentSetting('turretPic')
  }

  range() {
    return this.getCurrentSetting('range');
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
    return !this.button && this.select && this.level < this.maxLevel;
  }

  draw() {
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
      if (this.upgradePossible()) {
        this.button = createButton("Upgrade= " + this.upgradePrice);
        this.button.position(310, height + 10);
        this.button.size(150, 50);

        this.button.mousePressed(() => this.upgrade());
      }
    } else {
      if (this.button) {
        this.button.remove();
        delete this.button;
      }
    }

    push()
    rotate(this.angleToMob); // Rotate the turret to face the mob
    scale(this.zoom) //tween
    addShadows()
    push()
    scale(0.2);
    image(config.getImageMap(this.config().imageMap, this.level - 1), 0, 0)
    pop()
    pop()

    if (this.firing) {
      push();
      fX = cos(this.angleToMob) * 28;
      fY = sin(this.angleToMob) * 28;
      translate(fX, fY);
      rotate(this.angleToMob + PI / 2);
      translate(-3, -6)

      if (this.level == 1) {
        image(config.imageFiles.fire, 0, 0, 80, 60)
      }
      else {
        image(config.imageFiles.fire, -13, 0, 60, 40)
        image(config.imageFiles.fire, 13, 0, 60, 40)
      }
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
      interval: [500, 250, 200],
      damage: [3, 2, 3],
      range: [100, 150, 200],
      imageMap: "turretMap",
      // this.upgradePrice: [1,2,3]
    }
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
      interval: [500, 250, 200],
      damage: [3, 2, 3],
      range: [100, 150, 200],
      imageMap: "twinGunMap",
      // this.upgradePrice: [1,2,3]
    }
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
      interval: [500, 250, 200],
      damage: [3, 2, 3],
      range: [100, 150, 200],
      imageMap: "cannonMap",
      // this.upgradePrice: [1,2,3]
    }
  }
}
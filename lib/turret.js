class Turret {
  constructor(x, y) {
    this.initial_damage = 2
    this._range = 150;
    this.size = 60;
    this.angleToMob = 0;
    this.x = x;
    this.y = y;
    this.active = true;
    this.firing = false;
    this.select = false;

    this.zoom = 1
    this.upgradePrice = (Math.random() < 0.5) ? 10 : 20; //test

    var shootInterval = 500;
    this.setShootingSpeed(shootInterval);
    this.level = 1;
  }

  setShootingSpeed(interval) {
    this.shootInterval = interval;
    delete (this._interval)
    this._interval = setInterval(() => this.shoots(), this.shootInterval);
  }

  upgrade() {
    this.level++;
    this.setShootingSpeed(this.shootInterval / 2);
    this.double = true
  }

  damage() {
    var damage_levels = [1, 2, 4, 10];
    return damage_levels[this.level - 1];
  }

  turretPic() {
    var turretPics = ["turret", "twinGun", "twinGun"];
    return turretPics[this.level - 1]
  }

  range() {
    // if (this.level == 1 )
    //   return this._range
    // if (this.level == 2 )
    //   return this._range * 3

    return this._range * this.level;
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
      console.log('Turret clicked!');
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

    if (config.sound)
      sounds.canon.play()
    target.hit(this.damage());
    this.firing = true;

    createjs.Tween.get(this)
      .to({ zoom: 1.1 }, 50, createjs.Ease.getPowInOut(1))
      .to({ zoom: 0.8 }, 100, createjs.Ease.getPowInOut(1))
      .to({ zoom: 1 }, 100, createjs.Ease.getPowInOut(1))

    setTimeout(() => { this.firing = false }, 100)
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
    if (!this.active || this.select) {
      push();
      fill(100, 100, 200, 100);
      noStroke();
      circle(0, 0, this.range() * 2);
      pop();
      if (!this.button && this.select) {
        this.button = createButton("Upgrade= " + this.upgradePrice);
        this.button.position(500, height + 10);
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
    image(images[this.turretPic()], 0, 0, this.size * 2, this.size * 1.5)
    pop()

    if (this.firing) {
      push();
      fX = cos(this.angleToMob) * 28;
      fY = sin(this.angleToMob) * 28;
      translate(fX, fY);
      rotate(this.angleToMob + PI / 2);
      translate(-3, -6)
      image(images.fire, 0, 0, 80, 60);
      pop();
    }
    pop();
  }
}
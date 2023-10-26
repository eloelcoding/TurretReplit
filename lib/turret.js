class Turret {
  constructor(x, y) {
    // this.damage = 1
    this.range = 150;
    this.size = 60;
    this.angleToMob = 0;
    this.x = x;
    this.y = y;
    this.active = true;
    this.firing = false;
    
    this.shootInterval = 500;
    setInterval(() => this.shoots(), this.shootInterval);
  }

  targetEnemy() {
    var enemiesAliveAndNear = enemies.filter((enemy) => enemy.alive);
    var range = this.range;
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

  shoots() {
    if (!this.active) return;
    var target = this.targetEnemy();
    if (!target) return;

    this.damage = 1;
    target.hit(this.damage);
    this.firing = true;
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
    if (!this.active) {
      push();
      fill(100, 100, 200, 100);
      noStroke();
      circle(0, 0, this.range * 2);
      pop();
    }

    push()
    rotate(this.angleToMob); // Rotate the turret to face the mob
    image(img, 0, 0, this.size * 2, this.size * 1.5);
    pop()

    if(this.firing) {
      push();
      fX = cos(this.angleToMob) * 30;
      fY = sin(this.angleToMob) * 30;
      translate(fX, fY);
      rotate(this.angleToMob + PI / 2);
      image(imgFire, 0, 0, 100, 60);
      pop(); 
    }
    pop();
  }
}
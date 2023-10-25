class Turret {
  constructor(x, y) {
    // this.damage = 1
    this.speed = 1;
    this.range = 150;
    this.size = 60;
    this.angleToMob = 0;
    this.x = x;
    this.y = y;
    this.active = true;
    setInterval(() => this.shoots(), 500 / this.speed);
  }

  targetEnemy() {
    var enemiesAlive = enemies.filter((enemy) => enemy.alive);

    if (enemiesAlive.length == 0) return; //closest enemy
    enemiesAlive.sort((e1, e2) => e2.index - e1.index);
    var enemyToShoot = enemiesAlive[0];
    return enemyToShoot;
  }

  shoots() {
    if (!this.active) return;
    var target = this.targetEnemy();
    if (!target) return;

    push();
    fX = this.x + cos(this.angleToMob) * 30;
    fY = this.y + sin(this.angleToMob) * 30;
    translate(fX, fY);
    rotate(this.angleToMob + PI / 2);
    image(imgFire, 0, 0, 100, 60);
    pop();
    this.damage = 1;
    target.hit(this.damage);
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
    rotate(this.angleToMob); // Rotate the turret to face the mob
    if (!this.active) {
      push();
      fill(100, 100, 200, 100);
      noStroke();
      circle(0, 0, this.range * 2);
      pop();
    }
    image(img, 0, 0, this.size * 2, this.size * 1.5);
    pop();
  }
}
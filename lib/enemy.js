const STOPSIGN = ".";

class EnemyController {
  constructor(path) {
    this.enemies = [];
    this.path = path;
    this._enemyHealth = config.enemyHealth;
  }

  setEnemyHealth(health) {
    this._enemyHealth = floor(health)
  }

  cleanup() {
    this.enemies = this.enemies.filter(e => e.alive);
  }

  createEnemy() {
    var newEnemy = new Enemy(this.path.x, this.path.y, this._enemyHealth);
    newEnemy.setDirections(this.path.path);
    this.enemies.push(newEnemy);
  }

  initialize() {
    this.createEnemy();
    setInterval(() => this.createEnemy(), 1500);
  }

  targetEnemy(x, y, range) {
    var enemiesAliveAndNear = this.enemies.filter((enemy) => enemy.alive);
    enemiesAliveAndNear = enemiesAliveAndNear.filter((enemy) => {
      var distance = dist(x, y, enemy.x, enemy.y);
      return distance < range;
    })

    if (enemiesAliveAndNear.length == 0) return; //most advanced enemy
    // sort enemies based on their positionOnTrack
    enemiesAliveAndNear.sort((e1, e2) => e2.positionOnTrack - e1.positionOnTrack);
    var enemyToShoot = enemiesAliveAndNear[0];
    return enemyToShoot;
  }

  draw() {
    this.enemies.map((enemy) => {
      enemy.draw();
      enemy.move();
    });
  }
}



class Enemy {
  constructor(startX, startY, health) {
    this.x = startX;
    this.y = startY;
    this.size = 30;
    this.speed = (Math.random() < 0.2) ? 3 : 1; //complete this later (connect it var slow)
    this.alive = true;
    this.health = health;
    this.originalHealth = health
    this.damage = 2;
    this.positionOnTrack = 0;
    this.moveAmount = 40;
    this.directions = ""; // Store the directions as a string
    this.currentDirectionIndex = 0; // Track the current direction
    this.zoom = 1
  }

  setDirections(directions) {
    if (directions == undefined)
      throw new Error("Directions are not defined");
    // Set the directions for the enemy to follow
    this.directions = directions.concat([STOPSIGN]);
    this.currentDirectionIndex = 0; // Reset the direction index
  }

  hit(hitPower) {
    this.hitPower = hitPower;
    this.health -= this.hitPower;
    this.health = max(0, this.health)
    createjs.Tween.get(this)
      .to({ zoom: 0.7 }, 50, createjs.Ease.getPowInOut(1))
      .to({ zoom: 1 }, 100, createjs.Ease.getPowInOut(1))

    if (this.health <= 0) {
      config.playSound("boom");
      // Spawn death effect particles
      effectsManager.spawnDeathEffect(this.x, this.y, [180, 60, 70]);
      createjs.Tween.get(this)
        .to({ zoom: 0.3 }, 100, createjs.Ease.getPowInOut(1))
        .call(() => this.destroy())
      game.money += this.damage * this.originalHealth / 2;
    }
  }

  destroy() {
    this.alive = false;
    game.enemyController.cleanup();
  }

  move() {
    if (!this.alive) return;
    if (this.directions.length > 0) {
      // Get the current direction
      var slow = 10 * this.speed;
      var positionOnTrack = floor(this.currentDirectionIndex / slow);
      this.positionOnTrack = positionOnTrack;
      const currentDirection = this.directions[positionOnTrack];
      if (currentDirection === "R") this.x += this.moveAmount / slow;
      else if (currentDirection === "L") this.x -= this.moveAmount / slow;
      else if (currentDirection === "D") this.y += this.moveAmount / slow;
      else if (currentDirection === "U") this.y -= this.moveAmount / slow;
      else if (currentDirection === STOPSIGN) {
        this.alive = false;
        game.takeHit(this.damage);
        this.destroy();
      } else if (currentDirection != STOPSIGN)
        throw new Error(`Wrong character for a path: ${currentDirection}!`);

      if (positionOnTrack < this.directions.length - 1) {
        this.currentDirectionIndex++;
      }
    }
  }

  drawHealthBar() {
    let barWidth = this.size + 10;
    let barHeight = 6;
    let barY = -this.size / 2 - 12;
    let healthPercent = this.health / this.originalHealth;
    
    // Background (dark)
    push();
    noStroke();
    fill(40, 40, 40);
    rectMode(CORNER);
    rect(-barWidth / 2, barY, barWidth, barHeight, 2);
    
    // Health fill (gradient from green to red based on health)
    let healthColor;
    if (healthPercent > 0.6) {
      healthColor = [80, 200, 100]; // Green
    } else if (healthPercent > 0.3) {
      healthColor = [230, 180, 50]; // Yellow
    } else {
      healthColor = [220, 60, 60]; // Red
    }
    
    fill(healthColor[0], healthColor[1], healthColor[2]);
    rect(-barWidth / 2 + 1, barY + 1, (barWidth - 2) * healthPercent, barHeight - 2, 1);
    
    // Shine effect
    fill(255, 255, 255, 60);
    rect(-barWidth / 2 + 1, barY + 1, (barWidth - 2) * healthPercent, (barHeight - 2) / 2, 1);
    pop();
  }

  draw() {
    if (!this.alive) return;
    push();
    translate(this.x, this.y)
    
    // Draw health bar
    this.drawHealthBar();
    
    push()
    scale(this.zoom)
    fill(180, 60, 70);
    stroke(120, 40, 50);
    strokeWeight(2);
    rect(0, 0, this.size, this.size);
    pop();
    pop()
  }
}

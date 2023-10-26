
class Enemy {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.size = 30;
    this.speed = (Math.random() < 0.2) ? 3 : 1; //complete this later (connect it var slow)
    this.alive = true;
    this.health = 3;
    this.damage = 2;
    this.positionOnTrack = 0;
    this.moveAmount = 40;
    this.directions = ""; // Store the directions as a string
    this.currentDirectionIndex = 0; // Track the current direction
  }

  setDirections(directions) {
    // Set the directions for the enemy to follow
    this.directions = directions + STOPSIGN;
    this.currentDirectionIndex = 0; // Reset the direction index
  }

  hit(hitPower) {
    this.hitPower = hitPower;
    this.health -= this.hitPower;
    if (this.health <= 0) {
      this.alive = false;
      game.money += this.damage;
    }
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
      } else if (currentDirection != STOPSIGN)
        throw new Error("Wrong character!");

      if (positionOnTrack < this.directions.length - 1) {
        this.currentDirectionIndex++;
      }
    }
  }

  draw() {
    if (!this.alive) return;
    push();
    fill(100);
    rect(this.x, this.y, this.size, this.size);
    pop();
    text(this.health, this.x, this.y);
  }
}

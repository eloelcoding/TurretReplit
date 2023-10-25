let img;
let img2;
let rotationAngle = 0;
let game;
let enemies;
let pathkey;
let fX;
let fY;
let enemyToShoot;

const STOPSIGN = ".";

class Enemy {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.size = 30;
    this.alive = true;
    this.health = 3;
    this.damage = 2;
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
    // print("hit")
  }

  move() {
    if (!this.alive) return;
    if (this.directions.length > 0) {
      // Get the current direction
      var slow = 10;
      var index = floor(this.currentDirectionIndex / slow);
      const currentDirection = this.directions[index];

      if (currentDirection === "R") this.x += this.moveAmount / slow;
      else if (currentDirection === "L") this.x -= this.moveAmount / slow;
      else if (currentDirection === "D") this.y += this.moveAmount / slow;
      else if (currentDirection === "U") this.y -= this.moveAmount / slow;
      else if (currentDirection === STOPSIGN) {
        this.alive = false;
        game.takeHit(this.damage);
      } else if (currentDirection != STOPSIGN)
        throw new Error("Wrong character!");

      if (index < this.directions.length - 1) {
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

  shoots() {
    if (!this.active) return;
    var target = targetEnemy();
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
    if (enemyToShoot && this.active == 1) {
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

class Path {
  constructor(path, x, y, size) {
    this.path = path.split("");
    this.x = x;
    this.y = y;
    this.size = size;
  }

  draw() {
    var x = this.x;
    var y = this.y;
    var size = this.size;
    rect(x, y, size);
    this.path.forEach((p) => {
      if (p == "R") x += size;
      if (p == "L") x -= size;
      if (p == "U") y -= size;
      if (p == "D") y += size;

      rect(x, y, size, size);
    });
  }
}

function setButtonState(button, state) {
  button.active = state
  if (state) {
    button.removeAttribute('disabled'); // Enable the button
    // button.style('background-color', '#007BFF'); // Set the button's background color
  } else {
    button.attribute('disabled', true); // Disable the button
    // button.style('background-color', '#D3D3D3'); // Set a gray background color
  }
}

class Game {
  constructor() {
    this.score = 50;
    this.money = 200;
    this.turretPrice = 20;
    this.turrets = [];
    this.turrets = [new Turret(340, 300), new Turret(200, 150)]

  }
  buyTurret() {
    // for(let i = 0; i = 100; i++);
    if (this.money >= 20) {
      setButtonState(button, false);
      setTimeout(() => {
        this.nextTurret = new Turret();
        this.nextTurret.active = false;
        setButtonState(button, true);
      }, 200)

    }
  }
  mousePlace() {
    if (!this.nextTurret) return;
    this.nextTurret.active = true;
    this.turrets.push(this.nextTurret);
    this.nextTurret = undefined;
    this.money -= this.turretPrice;
  }

  takeHit(damage) {
    this.score -= 1;
  }

  gameOver() {
    return this.score <= 0;
  }


  draw() {
    this.turrets.map((turret) => turret.draw());
    text(this.score + "♡", 20, 50);
    textSize(40);
    text(this.money + " bucks", 400, 50);
    if (this.nextTurret) { // nextTurret is defined
      print(this.nextTurret)
      print(this.nextTurret.active)
      this.nextTurret.x = mouseX;
      this.nextTurret.y = mouseY;
      this.nextTurret.draw();
    }
  }
}

function setup() {
  createCanvas(660, 550);
  imageMode(CENTER);
  rectMode(CENTER);
  pathKey = "RRUUUUUUURRRRDDDDRRRRUUUUUUURRRRDDDDDDDDRR";
  path = new Path(pathKey, 20, 500, 40);
  hits = 0;
  enemies = [];
  game = new Game();
  angleToMob = 0;

  createEnemy();
  setInterval(createEnemy, 600);

  // turret = new Turret(340, 300);
  button = createButton("Buy Turret= " + game.turretPrice + " bucks");
  button.position(10, height + 10);
  button.size(150, 50);
  button.mousePressed(() => game.buyTurret());
}

function preload() {
  img = loadImage("sprites/turret.png");
  // img = loadImage("sprites/download.jpeg")
  // img2 = loadImage("sprites/bullet.png");
  imgFire = loadImage("/sprites/fire.svg");
}

function mouseClicked() {
  game.mousePlace();
}

function createEnemy() {
  print("Creating enemy");
  var newEnemy = new Enemy(path.x, path.y);
  newEnemy.setDirections(pathKey);
  enemies.push(newEnemy);
}

function targetEnemy() {
  var enemiesAlive = enemies.filter((enemy) => enemy.alive);

  if (enemiesAlive.length == 0) return;
  var enemyToShoot = enemiesAlive[0];
  return enemyToShoot;
}

function draw() {
  background(200, 220);
  path.draw();

  enemyToShoot = targetEnemy();


  enemies.map((enemy) => {
    enemy.draw();
    enemy.move();
  });

  game.draw();

  // if(turret.shoots()!=false){ push()

  // translate(fX,fY)
  // rotate(angleToMob+PI/2)
  //  image(imgFire,0,0,100,60)
  // pop() }
}

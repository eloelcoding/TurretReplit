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
  imgFire = loadImage("sprites/fire.svg");
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

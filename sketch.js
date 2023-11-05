let rotationAngle = 0;
let game;
let enemies;
let fX;
let fY;
let slider;
let enemyHealth = 5;

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
    this.score = 100;
    this.money = 200;
    this.turretPrice = 40;
    this.turrets = [
      new Turret(40, 400),
      new Turret(340, 280),
      new Turret(200, 150),
    ]

    this.shop = new Shop(false);
  }
  buyTurret() {
    // for(let i = 0; i = 100; i++);
    if (this.money >= this.turretPrice) {
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
    this.shop.draw();
  }
}

function setup() {
  createCanvas(750, 550);
  imageMode(CENTER);
  rectMode(CENTER);
  var pathConfig = config.path;
  path = new Path(pathConfig.key, pathConfig.x, pathConfig.y, pathConfig.size);
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
  slider = createSlider(1, 9, enemyHealth); // (min, max, default)
  slider.position(200, height + 10);

  var toggleShopButton = createCheckbox("Toggle shop");
  toggleShopButton.position(500, height + 10);
  toggleShopButton.size(150, 50);
  toggleShopButton.mousePressed(() => {
    game.shop.toggle();
    toggleShopButton = !toggleShopButton;
  });

  
  config.addButtons()

  config.playSound("war", 0.3, true)
}

function preload() {
  config.preload();
}

function mouseClicked() {
  game.mousePlace();

  var found = false;
  for (let i = 0; i < game.turrets.length; i++) {
    let turret = game.turrets[i];

    if (!found) {
      found = turret.selection();
    }
    else
      turret.select = false

  }
}

function createEnemy() {
  var newEnemy = new Enemy(path.x, path.y, enemyHealth);
  newEnemy.setDirections(config.path.key);
  enemies.push(newEnemy);
}


function draw() {
  background(200, 220);
  path.draw();

  enemyHealth = slider.value();

  enemies.map((enemy) => {
    enemy.draw();
    enemy.move();
  });

  game.draw();
}

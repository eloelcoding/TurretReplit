let game;
let enemies;
let slider;
let enemyHealth = 5;

const STOPSIGN = ".";



function setup() {
  print(window.location)
  cursor(HAND);
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
  slider = createSlider(1, 20, enemyHealth); // (min, max, default)
  slider.position(170, height + 10);

  upgradeHere = createButton("upgrade button here");
  upgradeHere.position(310, height + 10);
  upgradeHere.size(150, 50);
  upgradeHere.attribute('disabled', true); // Disable the button

  var toggleShopButton = createCheckbox("Toggle shop");
  toggleShopButton.position(500, height + 10);
  toggleShopButton.size(150, 50);
  toggleShopButton.mousePressed(() => {
    game.shop.toggle();
    toggleShopButton = !toggleShopButton;
  });

  config.addButtons()
  config.playSound("war", 0.3, true);
  config.setFont(config.defaultFont)

}

function preload() {
  config.preload();
}

// the keyPressed didn't seem to ever be called

function mouseClicked() {

  game.shop.mouseClicked();
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

function keyTyped() {

  game.keyTyped();
}

function doubleClicked() {
  game.doubleClicked();
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

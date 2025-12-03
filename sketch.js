let game;
let slider;
let enemyHealth;

function createButtons() {
  enemyHealth = 4;
  // setInterval(() => {
  //   enemyHealth *= 1.03;
  // }, 2500);
}

function preload() {
  config.preload();
}

function setup() {
  print(window.location)
  cursor(HAND);
  createCanvas(800, 550);
  imageMode(CENTER);
  rectMode(CENTER);

  // Initialize effects manager
  effectsManager = new EffectsManager();

  var pathConfig = config.path;
  path = new Path(pathConfig.key, pathConfig.x, pathConfig.y, pathConfig.size);

  game = new Game(path);
  game.startEnemyController();

  createButtons();
  config.addButtons()
  config.playSound("war", 0.3, true);
  // config.setFont(config.defaultFont)
}

function mouseClicked() {
  game.shop.mouseClicked();
  game.mousePlace();
  game.mouseClicked();
}

function keyTyped() {
  game.keyTyped();
}

function doubleClicked() {
  game.doubleClicked();
}

function draw() {
  background(25, 28, 35);
  game.enemyController.setEnemyHealth(enemyHealth);
  game.draw();
  
  // Update and draw effects
  effectsManager.update();
  effectsManager.draw();
}

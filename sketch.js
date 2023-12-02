let game;
let slider;

function createButtons() {
  var enemyHealth = 5;
  slider = createSlider(1, 20, enemyHealth); // (min, max, default)
  slider.position(170, height + 10);
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
  background(200, 220);
  game.enemyController.setEnemyHealth(slider.value());
  game.draw();
}

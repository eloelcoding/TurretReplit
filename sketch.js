let game;
let slider;

function createButtons() {
  var enemyHealth = 5;
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
}

function preload() {
  config.preload();
}

function setup() {
  print(window.location)
  cursor(HAND);
  createCanvas(750, 550);
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

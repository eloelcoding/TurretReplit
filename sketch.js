let game;
let slider;
let enemyHealth;
let audioStarted = false;

function createButtons() {
  enemyHealth = 4;
  // setInterval(() => {
  //   enemyHealth *= 1.03;
  // }, 2500);
}

// Start audio after first user interaction (browser autoplay policy)
function initAudio() {
  if (audioStarted) return;
  audioStarted = true;
  
  // Start music if enabled
  if (config.music) {
    config.playMusic("nexus", 0.3);
  }
}

function preload() {
  config.preload();
}

function setup() {
  print(window.location)
  cursor(HAND);
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  rectMode(CENTER);
  
  // Set futuristic font
  textFont('Orbitron');
  
  // Calculate global scale factor
  config.updateScale();
  config.setMap(config.currentMap);

  // Initialize space background
  spaceBackground = new SpaceBackground(windowWidth, windowHeight);

  // Initialize effects manager
  effectsManager = new EffectsManager();

  var pathConfig = config.path;
  path = new Path(pathConfig.key, pathConfig.x, pathConfig.y, pathConfig.size);

  game = new Game(path);
  game.startEnemyController();

  createButtons();
  config.addButtons();
  
  // Note: Music will start on first user interaction due to browser autoplay policy
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  config.updateScale();
  spaceBackground = new SpaceBackground(windowWidth, windowHeight);
}

function mouseClicked() {
  initAudio();  // Start audio on first click (browser autoplay policy)
  game.shop.mouseClicked();
  game.mousePlace();
  game.mouseClicked();
}

function keyTyped() {
  initAudio();  // Start audio on first keypress (browser autoplay policy)
  game.keyTyped();
}

function doubleClicked() {
  game.doubleClicked();
}

function draw() {
  // Draw space background with stars and nebulae
  spaceBackground.draw();
  
  game.enemyController.setEnemyHealth(enemyHealth);
  game.draw();
  
  // Update and draw effects
  effectsManager.update();
  effectsManager.draw();
}

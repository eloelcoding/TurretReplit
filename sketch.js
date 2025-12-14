let game;
let slider;
let audioStarted = false;
let menu;

function createButtons() {
  // Buttons are now handled by config.addButtons()
}

// Start audio after first user interaction (browser autoplay policy)
function initAudio() {
  if (audioStarted) return;
  audioStarted = true;
  
  // Start music if volume > 0
  if (config.musicVolume > 0) {
    config.playMusic("nexus");
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
  menu = new Menu();
  
  // Check dev mode setting from config
  if (config.devMode) {
    // Skip menu, start game directly
    setGameState(GameState.PLAYING);
    game.startGame();
  } else {
    // Production: show menu
    setGameState(GameState.MENU);
  }

  createButtons();
  config.addButtons();
  
  // Don't start enemy controller automatically - waves will handle it
  
  // Note: Music will start on first user interaction due to browser autoplay policy
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  config.updateScale();
  spaceBackground = new SpaceBackground(windowWidth, windowHeight);
}

function mouseClicked() {
  initAudio();  // Start audio on first click (browser autoplay policy)
  
  const state = getGameState();
  if (state === GameState.MENU) {
    menu.handleClick();
    return;
  }
  
  if (state === GameState.PLAYING) {
    game.shop.mouseClicked();
    // Update cursor based on turret placement validity
    if (game.nextTurret) {
      var minDistance = 60;
      var isValidPlacement = !game.path.isTooCloseToPath(mouseX, mouseY, minDistance);
      cursor(isValidPlacement ? HAND : ARROW);
    }
    game.mousePlace();
    game.mouseClicked();
  }
}

function keyTyped() {
  initAudio();  // Start audio on first keypress (browser autoplay policy)
  
  const state = getGameState();
  if (state === GameState.GAME_OVER && (key === 'r' || key === 'R')) {
    // Restart game
    setGameState(GameState.MENU);
    // Reset game will happen when starting from menu
  } else if (state === GameState.PLAYING) {
    game.keyTyped();
  }
}

function doubleClicked() {
  const state = getGameState();
  if (state === GameState.PLAYING || state === GameState.WAVE_BREAK) {
    game.doubleClicked();
  }
}

function draw() {
  // Draw space background with stars and nebulae
  spaceBackground.draw();
  
  const state = getGameState();
  
  if (state === GameState.MENU) {
    menu.draw();
  } else if (state === GameState.PLAYING || state === GameState.WAVE_BREAK) {
    // Update wave manager
    if (game && game.waveManager) {
      game.waveManager.update();
      if (game.waveManager.inWaveBreak) {
        setGameState(GameState.WAVE_BREAK);
      } else if (state === GameState.WAVE_BREAK && !game.waveManager.inWaveBreak) {
        setGameState(GameState.PLAYING);
      }
    }
    
    // Check for game over
    if (game && game.gameOver()) {
      setGameState(GameState.GAME_OVER);
    }
    
    // Update cursor based on turret placement validity
    if (game.nextTurret) {
      var minDistance = 60;
      var isValidPlacement = !game.path.isTooCloseToPath(mouseX, mouseY, minDistance);
      cursor(isValidPlacement ? HAND : ARROW);
    }
    
    game.draw();
    
    // Update and draw effects
    effectsManager.update();
    effectsManager.draw();
  } else if (state === GameState.GAME_OVER) {
    // Draw game over screen
    push();
    fill(0, 0, 0, 200);
    rectMode(CORNER);
    rect(0, 0, width, height);
    
    textAlign(CENTER, CENTER);
    textSize(64);
    textStyle(BOLD);
    fill(255, 50, 50);
    text("GAME OVER", width / 2, height / 2 - 100);
    
    textSize(24);
    textStyle(NORMAL);
    fill(200, 200, 200);
    text("Wave Reached: " + (game.waveManager ? game.waveManager.currentWave : 0), width / 2, height / 2);
    
    textSize(20);
    fill(150, 150, 150);
    text("Press R to restart", width / 2, height / 2 + 80);
    
    pop();
  }
}

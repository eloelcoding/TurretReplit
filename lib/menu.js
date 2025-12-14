// Main menu screen
class Menu {
  constructor() {
    this.startButton = {
      x: 0,
      y: 0,
      width: 300,
      height: 60,
      hover: false
    };
  }

  draw() {
    push();
    
    // Semi-transparent overlay
    fill(0, 0, 0, 200);
    rectMode(CORNER);
    rect(0, 0, width, height);
    
    // Title
    textAlign(CENTER, CENTER);
    textSize(72);
    textStyle(BOLD);
    fill(0, 200, 255);
    text("TURRET DEFENSE", width / 2, height / 2 - 150);
    
    // Subtitle
    textSize(24);
    textStyle(NORMAL);
    fill(200, 200, 200);
    text("Protect your base from alien invaders", width / 2, height / 2 - 80);
    
    // Start button
    let btnX = width / 2;
    let btnY = height / 2 + 50;
    this.startButton.x = btnX - this.startButton.width / 2;
    this.startButton.y = btnY - this.startButton.height / 2;
    
    // Check if mouse is over button
    this.startButton.hover = (
      mouseX >= this.startButton.x &&
      mouseX <= this.startButton.x + this.startButton.width &&
      mouseY >= this.startButton.y &&
      mouseY <= this.startButton.y + this.startButton.height
    );
    
    // Button background
    if (this.startButton.hover) {
      fill(0, 150, 200);
      cursor(HAND);
    } else {
      fill(0, 100, 150);
      cursor(ARROW);
    }
    stroke(0, 200, 255);
    strokeWeight(3);
    rectMode(CORNER);
    rect(this.startButton.x, this.startButton.y, this.startButton.width, this.startButton.height, 10);
    
    // Button text
    fill(255);
    textSize(32);
    textStyle(BOLD);
    text("START GAME", btnX, btnY);
    
    // Instructions
    textSize(18);
    textStyle(NORMAL);
    fill(150, 150, 150);
    text("Click to place turrets • Defend your base", width / 2, height / 2 + 150);
    
    pop();
  }

  handleClick() {
    if (this.startButton.hover) {
      setGameState(GameState.PLAYING);
      if (game) {
        game.startGame();
      }
      return true;
    }
    return false;
  }
}


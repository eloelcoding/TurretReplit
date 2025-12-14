// Shop items that aren't turrets - consumables and upgrades
class HealthItem {
  constructor() {
    this.price = config.prices.healthItem;
    this.type = "healthItem";
    this.name = "Health Pack";
  }
  
  use() {
    if (game.money >= this.price) {
      game.money -= this.price;
      game.addHealth(20);
      return true;
    }
    return false;
  }
  
  draw(x, y, disabled) {
    push();
    translate(x, y);
    
    // Draw health pack icon - smaller
    fill(255, 50, 50);
    stroke(255, 100, 100);
    strokeWeight(2);
    rectMode(CENTER);
    rect(0, 0, 40, 50, 6);
    
    // Medical cross - smaller
    stroke(255, 255, 255);
    strokeWeight(2);
    line(0, -8, 0, 8);
    line(-8, 0, 8, 0);
    
    // +20 text - smaller
    fill(255, 255, 255);
    textSize(10);
    textAlign(CENTER);
    text("+20", 0, 22);
    
    if (disabled) {
      fill(0, 0, 0, 150);
      rect(0, 0, 40, 50);
    }
    
    pop();
  }
}

class MaxHealthUpgrade {
  constructor() {
    this.price = config.prices.maxHealthUpgrade;
    this.type = "maxHealthUpgrade";
    this.name = "Max Health +";
    this.healthIncrease = 30;
  }
  
  use() {
    if (game.money >= this.price) {
      game.money -= this.price;
      game.increaseMaxHealth(this.healthIncrease);
      return true;
    }
    return false;
  }
  
  draw(x, y, disabled) {
    push();
    translate(x, y);
    
    // Draw upgrade icon
    fill(100, 200, 255);
    stroke(150, 220, 255);
    strokeWeight(3);
    rectMode(CENTER);
    rect(0, 0, 70, 70, 10);
    
    // Up arrow
    stroke(255, 255, 255);
    strokeWeight(4);
    fill(255, 255, 255);
    triangle(0, -15, -15, 5, 15, 5);
    
    // HP text - make it clearer with dynamic value
    fill(255, 255, 255);
    textSize(13);
    textAlign(CENTER);
    text("+" + this.healthIncrease, 0, 20);  // HP increase amount (dynamic)
    textSize(9);
    fill(200, 240, 255);
    text("MAX HP", 0, 32);  // Label to clarify it's max health
    
    if (disabled) {
      fill(0, 0, 0, 150);
      rect(0, 0, 70, 70);
    }
    
    pop();
  }
}


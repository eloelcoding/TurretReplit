class Shop {
  constructor(show) {
    this.height = 3;
    this.width = 4;
    this.show = show;
    this._appear = this.show ? 1 : 0;
    this.y = 320;  // Will be adjusted in draw()

    this.slots = [
      new Slot(10, -200, "turret"),
      new Slot(10, -120, "cannon"),
      new Slot(10, -40, "safe"),
      new Slot(10, 40, "medic"),
      new Slot(10, 120, "healthItem"),
      new Slot(10, 200, "maxHealthUpgrade"),
    ]
    var index = 0
    this.slots.map(
      slot => { slot.index = index++ }
    )
  }

  toggle() {
    if (this._appear != 0 && this._appear != 1) return;
    var target = 1 - this._appear
    createjs.Tween.get(this)
      .to({ _appear: target }, 250, createjs.Ease.getPowInOut(1))
      .to({ show: !this.show }, 0, createjs.Ease.getPowInOut(1))
  }

  keyTyped() {
    if (key >= 1 && key <= 6) {
      var slotIndex = key - 1;
      if (slotIndex < this.slots.length) {
        var slot = this.slots[slotIndex];
        
        // Handle special items (consumables)
        if (slot.item && (slot.type === "healthItem" || slot.type === "maxHealthUpgrade")) {
          slot.item.use();
          key = "";
          return;
        }
        
        // Handle turret/unit placement
        if (slot.type === "medic" || slot.type === "turret" || slot.type === "cannon" || slot.type === "safe") {
          var unit = Unit.create(slot.type, true, false);
          if (unit) {
            this.buyTurret(unit);
            key = "";
          }
        }
      }
    }
  }

  mouseClicked() {
    var hitSlot = false;
    this.slots.map(slot => { hitSlot = hitSlot || slot.mouseClicked() });
    if (!hitSlot) {
      var hitShop = mouseX > this.x - 80;
      if (hitShop)
        this.toggle()
    }
  }

  buyTurret(turret) {
    if (game.money >= turret.price) {
      cursor(MOVE);
      setTimeout(() => {
        // this.nextTurret = new Turret();
        // this.nextTurret.level = 
        game.nextTurret = turret;
        game.nextTurret.active = false;

      }, 200)

    }
  }

  drawPanel() {
    // Draw futuristic shop panel - compact version to fit all items
    push();
    
    // Main panel background - taller to fit 6 items
    fill(20, 25, 40);
    stroke(0, 170, 200);
    strokeWeight(3);
    rectMode(CORNER);
    rect(-100, -320, 220, 640, 12);
    
    // Inner panel
    fill(12, 15, 25);
    stroke(0, 100, 130);
    strokeWeight(2);
    rect(-90, -308, 200, 616, 10);
    
    // Header glow line
    stroke(0, 255, 255);
    strokeWeight(3);
    line(-78, -290, 98, -290);
    
    // Title
    noStroke();
    fill(0, 255, 255);
    textSize(28);
    textAlign(CENTER);
    text("ARMORY", 10, -255);
    
    // Decorative lines
    stroke(0, 150, 170);
    strokeWeight(2);
    line(-70, -235, -20, -235);
    line(40, -235, 90, -235);
    noStroke();
    fill(0, 255, 255);
    ellipse(10, -235, 8, 8);
    
    // Slot backgrounds - smaller and more compact
    let slotSpacing = 80;  // Reduced from 190
    let slotHeight = 70;    // Reduced from 150
    let startY = -200;
    
    for (let i = 0; i < this.slots.length; i++) {
      let slotY = startY + i * slotSpacing;
      fill(15, 20, 35);
      stroke(50, 60, 80);
      strokeWeight(2);
      rect(-78, slotY - slotHeight / 2, 176, slotHeight, 6);
      
      // Slot accent colors
      let accentColors = [
        [0, 200, 220],    // turret - cyan
        [255, 140, 0],    // cannon - orange
        [0, 255, 150],    // safe - green
        [100, 255, 150],  // medic - light green
        [255, 50, 50],    // healthItem - red
        [100, 200, 255]   // maxHealthUpgrade - blue
      ];
      stroke(accentColors[i][0], accentColors[i][1], accentColors[i][2]);
      strokeWeight(2);
      // Corner accents
      line(-78, slotY - slotHeight / 2 + 10, -78, slotY - slotHeight / 2);
      line(-78, slotY - slotHeight / 2, -65, slotY - slotHeight / 2);
      line(98, slotY - slotHeight / 2 + 10, 98, slotY - slotHeight / 2);
      line(98, slotY - slotHeight / 2, 85, slotY - slotHeight / 2);
    }
    
    // Credits display
    fill(10, 15, 25);
    stroke(0, 170, 200);
    strokeWeight(2);
    rect(-78, 280, 176, 45, 6);
    
    noStroke();
    fill(0, 200, 180);
    textSize(18);
    textAlign(LEFT);
    text("CR:", -65, 310);
    
    pop();
  }

  draw() {
    push()
    // Position shop relative to window size - moved further left
    this.x = width - 120 + 157 * (1 - this._appear)
    this.y = height / 2  // Center vertically
    translate(this.x, this.y)
    
    // Draw the panel
    this.drawPanel();
    
    // Draw credits amount
    fill(0, 255, 200);
    textSize(26);
    textAlign(RIGHT);
    text(floor(game.money), 88, 310);

    this.slots.map(slot => slot.draw())

    pop()
  }
}
class Slot {
  constructor(x, y, unitType) {
    this.x = x;
    this.y = y;
    this.radius = 50;  // Smaller click radius

    this.type = unitType;
    // Handle special item types
    if (unitType === "healthItem") {
      this.item = new HealthItem();
      this.unit = null;
    } else if (unitType === "maxHealthUpgrade") {
      this.item = new MaxHealthUpgrade();
      this.unit = null;
    } else {
      this.unit = Unit.create(unitType, false, false);
      this.item = null;
      // If unit creation failed (e.g., medic not loaded), try again later
      if (!this.unit && unitType === "medic") {
        // Will be created in draw() if needed
      }
    }

    this.imageSize = 1;
    this.imgPos = -10;

    this.textPos = 60;
  }

  itemPrice() {
    if (this.item) {
      return this.item.price;
    }
    return this.unit ? this.unit.price : 0;
  }
  
  mouseClicked() {
    this.mouseDist = dist(mouseX, mouseY, this.x + game.shop.x, this.y + game.shop.y)
    if (this.mouseDist < this.radius) {
      // Handle special items (consumables)
      if (this.item && (this.type === "healthItem" || this.type === "maxHealthUpgrade")) {
        if (this.item.use()) {
          return true;
        }
      } else {
        // Handle turret/unit placement
        var turret = Unit.create(this.type, true, false);
        if (turret) {
          game.shop.buyTurret(turret);
          return true;
        }
      }
    }
    return false;
  }
  
  draw() {
    push()
    translate(this.x, this.y)
    
    var disabled = game.money < this.itemPrice();
    
    // Draw item - smaller scale
    push()
    translate(0, -5)
    scale(0.9)  // Reduced from 1.5
    if (this.item && (this.type === "healthItem" || this.type === "maxHealthUpgrade")) {
      // Draw special item
      this.item.draw(0, 0, disabled);
    } else if (this.unit) {
      // Draw unit/turret
      this.unit.draw(disabled);
    } else if (this.type === "medic") {
      // Fallback: try to create medic if unit is null
      this.unit = Unit.create("medic", false, false);
      if (this.unit) {
        this.unit.draw(disabled);
      }
    }
    pop()
    
    // Price text - smaller
    textAlign(CENTER)
    textSize(14);
    fill(disabled ? color(80, 80, 80) : color(255, 200, 50))
    text(this.itemPrice() + " CR", 0, 35)
    
    // Item name label - bottom right
    textAlign(RIGHT);
    textSize(10);
    fill(200, 200, 200);
    var itemName = "";
    if (this.type === "healthItem") {
      itemName = "Health";
    } else if (this.type === "maxHealthUpgrade") {
      itemName = "Max HP+";
    } else if (this.type === "medic") {
      itemName = "Medic";
    } else if (this.type === "safe") {
      itemName = "Safe";
    } else if (this.type === "turret") {
      itemName = "Turret";
    } else if (this.type === "cannon") {
      itemName = "Cannon";
    }
    text(itemName, 80, 28);
    
    // Slot number badge - smaller
    var itemNumberX = -65
    var itemNumberY = -30
    push()
    fill(0, 80, 100)
    stroke(0, 180, 200)
    strokeWeight(2)
    circle(itemNumberX, itemNumberY, 24)
    pop()
    
    fill(0, 255, 255)
    textSize(16)
    textAlign(CENTER, CENTER)
    text(this.index + 1, itemNumberX, itemNumberY)
    
    pop()
  }

}
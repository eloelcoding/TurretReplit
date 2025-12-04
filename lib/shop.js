class Shop {
  constructor(show) {
    this.height = 3;
    this.width = 4;
    this.show = show;
    this._appear = this.show ? 1 : 0;
    this.y = 320;  // Will be adjusted in draw()

    this.slots = [
      new Slot(10, -180, "turret"),
      new Slot(10, 10, "cannon"),
      new Slot(10, 200, "safe"),
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
    if (key == 1 || key == 2 || key == 3) {
      var unitType = this.slots[key - 1].unit.type;
      key = ""
      //E: why is turret type never read?
      // doesn't work for some reason
      // if (game.nextTurret && game.nextTurret.type == turretType) {
      //   game.nextTurret = undefined;
      //   return;
      // }
      var unit = Unit.create(unitType, true, false);
      this.buyTurret(unit);
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
    // Draw futuristic shop panel directly - LARGER VERSION
    push();
    
    // Main panel background
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
    textSize(32);
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
    
    // Slot backgrounds
    for (let i = 0; i < 3; i++) {
      let slotY = -180 + i * 190;
      fill(15, 20, 35);
      stroke(50, 60, 80);
      strokeWeight(2);
      rect(-78, slotY - 65, 176, 150, 8);
      
      // Slot accent color (cyan for laser turret, orange for cannon, green for safe)
      let accentColors = [[0, 200, 220], [255, 140, 0], [0, 255, 150]];
      stroke(accentColors[i][0], accentColors[i][1], accentColors[i][2]);
      strokeWeight(3);
      // Corner accents
      line(-78, slotY - 50, -78, slotY - 65);
      line(-78, slotY - 65, -60, slotY - 65);
      line(98, slotY - 50, 98, slotY - 65);
      line(98, slotY - 65, 80, slotY - 65);
    }
    
    // Credits display
    fill(10, 15, 25);
    stroke(0, 170, 200);
    strokeWeight(2);
    rect(-78, 280, 176, 45, 6);
    
    noStroke();
    fill(0, 200, 180);
    textSize(20);
    textAlign(LEFT);
    text("CR:", -65, 310);
    
    pop();
  }

  draw() {
    push()
    // Position shop relative to window size
    this.x = width - 85 + 157 * (1 - this._appear)
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
    this.radius = 75;

    this.type = unitType;
    this.unit = Unit.create(unitType, false, false)

    this.imageSize = 1;
    this.imgPos = -10;

    this.textPos = 60;
  }

  itemPrice() {
    return this.unit.price;
  }
  mouseClicked() {
    this.mouseDist = dist(mouseX, mouseY, this.x + game.shop.x, this.y + game.shop.y)
    if (this.mouseDist < this.radius) {
      var turret = Unit.create(this.type, true, false)
      game.shop.buyTurret(turret)
      return true
    }
  }
  draw() {
    push()
    translate(this.x, this.y)
    
    // Draw unit - larger
    push()
    translate(0, -10)
    scale(1.5)
    var disabled = game.money < this.itemPrice();
    this.unit.draw(disabled)
    pop()
    
    // Price text - larger
    textAlign(CENTER)
    textSize(20);
    fill(disabled ? color(80, 80, 80) : color(255, 200, 50))
    text(this.itemPrice() + " CR", 0, 60)
    
    // Slot number badge - larger
    var itemNumberX = -62
    var itemNumberY = -50
    push()
    fill(0, 80, 100)
    stroke(0, 180, 200)
    strokeWeight(3)
    circle(itemNumberX, itemNumberY, 36)
    pop()
    
    fill(0, 255, 255)
    textSize(22)
    textAlign(CENTER, CENTER)
    text(this.index + 1, itemNumberX, itemNumberY)
    
    pop()
  }

}
class Shop {
  constructor(show) {
    this.height = 3;
    this.width = 4;
    this.show = show;
    this._appear = this.show ? 1 : 0;
    this.y = 275;

    this.slots = [
      new Slot(0, -150, "turret"),
      new Slot(0, 10, "twinGun"),
      new Slot(0, 170, "cannon"),
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
      var turretType = this.slots[key - 1].turret.type;
      key = ""
      //E: why is turret type never read?
      // doesn't work for some reason
      // if (game.nextTurret && game.nextTurret.type == turretType) {
      //   game.nextTurret = undefined;
      //   return;
      // }
      var turret = TurretBase.createTurret(turretType, true, false);
      this.buyTurret(turret);
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

  draw() {
    push()
    this.x = 715 + 157 * (1 - this._appear)
    translate(this.x, this.y)
    scale(0.85)
    image(config.getImage("shop"), 0, 0)
    fill(0xffffff)
    textSize(40)
    textAlign(CENTER)
    text(floor(game.money), 50, 298)

    this.slots.map(slot => slot.draw())

    pop()
  }
}
class Slot {
  constructor(x, y, turretType) {
    this.x = x;
    this.y = y;
    this.radius = 60;

    this.type = turretType;
    this.turret = Turret.createTurret(turretType, false, false)

    this.imageSize = 1;
    this.imgPos = -10;

    this.textPos = 60;
  }

  itemPrice() {
    return this.turret.price;
  }
  mouseClicked() {
    this.mouseDist = dist(mouseX, mouseY, this.x + game.shop.x, this.y + game.shop.y)
    if (this.mouseDist < this.radius) {
      var turret = Turret.createTurret(this.type, true, false)
      game.shop.buyTurret(turret)
      return true
    }
  }
  draw() {
    111
    push()
    translate(this.x, this.y)
    // scale(this.imageSize)
    // image(this.itemImage, 0, this.imgPos)
    push()
    translate(0, -20)
    scale(1.3)

    var disabled = game.money < this.itemPrice();
    this.turret.draw(disabled)
    pop()
    textAlign(CENTER)
    text("$" + this.itemPrice(), 0, 0 + this.textPos)
    textAlign(CENTER)
    var itemNumberX = -52
    var itemNumberY = -38
    push()
    fill(120)
    noStroke(true)
    circle(itemNumberX, itemNumberY - 10, 35)
    pop()
    textSize(30)
    text(this.index + 1, itemNumberX, itemNumberY)
    pop()
  }

}
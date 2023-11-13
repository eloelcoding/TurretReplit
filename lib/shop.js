class Shop {
  constructor() {
    this.height = 3;
    this.width = 4;
    this.show = true;
    this._appear = this.show ? 1 : 0;
    this.x;
    this.y = 275;

    this.slots = [
      new Slot(0, -150, "turret", 40),
      new Slot(0, 10, "twinGun", 60),
      new Slot(0, 170, "cannon", 80),
    ]
  }
  toggle() {
    if (this._appear != 0 && this._appear != 1) return;
    var target = 1 - this._appear
    createjs.Tween.get(this)
      .to({ _appear: target }, 250, createjs.Ease.getPowInOut(1))
      .to({ show: !this.show }, 0, createjs.Ease.getPowInOut(1))
  }

  mouseClicked() {
    this.slots.map(slot => slot.mouseClicked())
  }

  buyTurret(turret) {
    // for(let i = 0; i = 100; i++);
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
    this.x = 665 + 200 * (1 - this._appear)
    translate(this.x, this.y)
    scale(0.85)
    image(config.imageFiles.shop, 0, 0)
    fill(0xffffff)
    textSize(40)
    textAlign(CENTER)
    text(floor(game.money), 50, 298)

    this.slots.map(slot => slot.draw())
    // this.slot1.draw()
    // this.slot2.draw()
    // this.slot3.draw()

    pop()
    // text("Shop",100,)
    // push()
    // fill(0,200,200)
    // rectMode(CORNER)
    // stroke(50)
    // strokeWeight(5)
    // var size = 120;
    // var pctFill = 0.85;
    // rect(100,100,500,390,30)
    // for (let i = 0; i < this.height; i++) {
    //   for(let j = 0; j < this.width; j++) {
    //     rect(120 + j * size,120 + i * size, size*pctFill, size*pctFill,10)
    //   }
    // }
    // pop()
  }
}
class Slot {
  constructor(x, y, type, price) {
    this.x = x;
    this.y = y;
    this.radius = 60;

    this.type = type;
    this.turret = Turret.createTurret(type, false, false)

    this.imageSize = 1;
    this.imgPos = -10;

    this.itemPrice = this.turret.price;
    this.textPos = 60;
  }

  mouseClicked() {
    this.mouseDist = dist(mouseX, mouseY, this.x + game.shop.x, this.y + game.shop.y)
    if (this.mouseDist < this.radius) {
      var turret = Turret.createTurret(this.type, true, false)
      game.shop.buyTurret(turret)
      print("buy")
    }
  }
  draw() {
    push()
    translate(this.x, this.y)
    // scale(this.imageSize)
    // image(this.itemImage, 0, this.imgPos)
    push()
    translate(0, -20)
    scale(1.3)

    var disabled = game.money < this.itemPrice;
    this.turret.draw(disabled)
    pop()
    textAlign(CENTER)

    text("$" + this.itemPrice, 0, 0 + this.textPos)
    pop()
  }

}
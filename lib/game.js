
class Game {
  constructor() {
    this.score = 100;
    this.money = 100;
    this.turrets = [
      new Turret(220, 250),
      new Cannon(360, 400)
    ]

    this.shop = new Shop(false);
  }

  mousePlace() {
    if (!this.nextTurret) return;
    cursor(HAND)
    this.nextTurret.active = true;
    this.turrets.push(this.nextTurret);
    var target = this.money - this.nextTurret.price;
    createjs.Tween.get(this)
      .to({ money: target }, 250, createjs.Ease.getPowInOut(1))

    this.nextTurret = undefined;
  }

  takeHit(damage) {
    this.score -= damage;
  }

  gameOver() {
    return this.score <= 0;
  }


  draw() {
    this.turrets.map((turret) => turret.draw());
    push()
    textSize(40);
    text(this.score + "♡", 20, 50);
    // text(this.money + " bucks", 330, 120);
    pop()
    if (this.nextTurret) { // nextTurret is defined
      print(this.nextTurret)
      print(this.nextTurret.active)
      this.nextTurret.x = mouseX;
      this.nextTurret.y = mouseY;
      this.nextTurret.draw();
    }
    this.shop.draw();



    if (config.showMousePosition) {
      textSize(40);
      text(mouseX, 350, 50);
      text(mouseY, 450, 50);
    }

  }
}

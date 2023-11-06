class Shop {
  constructor(show) {
    this.height = 3;
    this.width = 4;
    this.show = false;
    this._appear = this.show ? 1 : 0;
  }

  toggle() {
    var target = 1 - this._appear
    createjs.Tween.get(this)
      .to({ _appear: target }, 250, createjs.Ease.getPowInOut(1))
      .to({ show: !this.show }, 0, createjs.Ease.getPowInOut(1))
}
  
  draw() {
    push()
    translate(665 + 200 * (1-this._appear),275)
    scale(0.85)
    image(config.imageFiles.shop,0,0)
    fill(0xffffff)
    textAlign(CENTER)
    text(game.money, 52, 298)
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
function addShadows() {
  if (!config.shadows) return;
  drawingContext.shadowOffsetX = 5;
  drawingContext.shadowOffsetY = -5;
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'black';
}

class Button {
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.w = img.width;
    this.h = img.height;
    this.img = img;

    print(img.width)
    print(img.height)
    var button = createButton('');
    button.position(x - this.w / 4, y - this.h / 4);
    button.size(this.w / 2, this.h / 2);
    button.mousePressed(() => this.click());
    button.style('background-color', 'rgba(255, 255, 255, 0)'); // RGB color with alpha (transparency)
    // button.style('border', 'none');

    this._button = button
  }

  draw() {
    push()
    // imageMode(CENTER)
    image(this.img, this.x, this.y, this.w, this.h)
    pop()
  }
}


class ShopItem extends Button {
  constructor(x, y, img) {
    super(x, y, img);
  }

  click() {
    print("Hello")
  }

}
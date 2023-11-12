function addShadows() {
  if (!config.shadows) return;
  drawingContext.shadowOffsetX = 5;
  drawingContext.shadowOffsetY = -5;
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'black';
}

class Button {
  constructor(x, y, w, h, img) {
    this.x = x;
    this.y = y;
    this.w = w;//img.width;
    this.h = h;//img.height;
    print(this.w); print(this.h);

    this.img = img;

    print(img.width)
    print(img.height)
  }

  isOnMouse() {
    var x = this.x;
    var y = this.y;
    if (max(abs(this.x - mouseX), abs(this.y - mouseY)) < this.w / 2) {
      // if (dist(this.x, this.y, mouseX, mouseY) < this.w / 2) {
      return true;
    }
    return false;
  }

  mouseClicked() {
    if (this.isOnMouse()) {
      this.clickAction()
      return true;
    }
  }

  draw() {
    push()
    image(this.img, this.x, this.y, this.w, this.h)
    pop()
  }
}


class ItemSlot extends Button {
  constructor(x, y, w, h, img) {
    super(x, y, w, h, img);
  }

  clickAction() {
    print("Hello")
  }

}
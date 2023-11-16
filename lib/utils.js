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


function setButtonState(button, state) {
  button.active = state
  if (state) {
    button.removeAttribute('disabled'); // Enable the button
    // button.style('background-color', '#007BFF'); // Set the button's background color
  } else {
    button.attribute('disabled', true); // Disable the button
    // button.style('background-color', '#D3D3D3'); // Set a gray background color
  }
}


class TextWidget {
  constructor(text, x, y) {
    this.x = x;
    this.y = y;
    this.text = text;

    this.rotation = 0
    this.transparency = 0;
    this.lift = 0;
    this.zoom = 1;
  }

  vanish(doWhenDone) {
    createjs.Tween.get(this)
      .to({ zoom: 0, transparency: 1, lift: 0 }, 1000, createjs.Ease.getPowInOut(1))
      .call(doWhenDone)
  }
  draw() {
    push()
    translate(this.x, this.y - this.lift)
    rotate(this.rotation)
    scale(this.zoom)
    fill(0, (1 - this.transparency) * 255)
    textSize(20);
    text(this.text, 0, 0);
    pop();
  }
}

class Path {
  constructor(path, x, y, size) {
    this.path = path.split("")
    this.x = x;
    this.y = y;
    this.size = size;
  }

  drawBlock(x, y, size, pathType) {
    push()
    if (pathType == 1) {
      fill(100, 255, 100)
    }
    if (pathType == 2) {
      fill(255, 100, 100)
    }
    rect(x, y, size, size);
    pop()

  }

  draw() {
    var x = this.x;
    var y = this.y;
    var size = this.size;
    rect(x, y, size);
    this.drawBlock(x-10, y, size * 1.5, 1);
    this.path.forEach((p) => {
      if (p == "R") x += size;
      if (p == "L") x -= size;
      if (p == "U") y -= size;
      if (p == "D") y += size;
      this.drawBlock(x, y, size, 0);
    });
    this.drawBlock(x, y, size * 1.5, 2);


  }
}

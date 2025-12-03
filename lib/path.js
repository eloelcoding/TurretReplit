
class Path {
  constructor(path, x, y, size) {
    this.path = path.split("")
    this.x = x;
    this.y = y;
    this.size = size;
  }

  drawBlock(x, y, size, pathType) {
    push()
    stroke(45, 50, 60);
    strokeWeight(1);
    if (pathType == 0) {
      fill(55, 62, 75);
    }
    else if (pathType == 1) {
      fill(60, 180, 100);
    }
    else if (pathType == 2) {
      fill(220, 80, 80);
    }
    rect(x, y, size, size);
    pop()

  }

  draw() {
    var x = this.x;
    var y = this.y;
    var size = this.size;
    this.drawBlock(x, y, size, 0);
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

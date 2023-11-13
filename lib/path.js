
class Path {
  constructor(path, x, y, size) {
    this.path = path.split("")
    this.x = x;
    this.y = y;
    this.size = size;
  }

  drawBlock(x, y, size, isEnd) {
    push()
    if (isEnd) {
      fill(255, 100, 100)
      print("red")
    }
    rect(x, y, size, size);
    pop()
  }

  draw() {
    var x = this.x;
    var y = this.y;
    var size = this.size;
    rect(x, y, size);
    this.path.forEach((p) => {
      if (p == "R") x += size;
      if (p == "L") x -= size;
      if (p == "U") y -= size;
      if (p == "D") y += size;
      this.drawBlock(x, y, size, false);
    });
    this.drawBlock(x, y, 3, true);


  }
}

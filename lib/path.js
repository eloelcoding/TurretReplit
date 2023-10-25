
class Path {
  constructor(path, x, y, size) {
    this.path = path.split("");
    this.x = x;
    this.y = y;
    this.size = size;
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

      rect(x, y, size, size);
    });
  }
}

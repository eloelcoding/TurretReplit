
class Path {
  constructor(path, x, y, size) {
    this.path = path.split("")
    this.x = x;
    this.y = y;
    this.size = size;
    this.tileIndex = 0;
  }

  drawBlock(x, y, size, pathType, index) {
    push()
    rectMode(CORNER);
    
    if (pathType == 0) {
      // Main path - alternating subtle colors
      let isEven = index % 2 === 0;
      
      // Base colors with subtle alternation
      let baseR = isEven ? 18 : 24;
      let baseG = isEven ? 26 : 32;
      let baseB = isEven ? 36 : 42;
      
      // Draw main tile
      stroke(0, 60, 80, 150);
      strokeWeight(1);
      fill(baseR, baseG, baseB);
      rect(x, y, size, size);
      
      // Add subtle inner glow/border
      noFill();
      stroke(0, 100, 130, 80);
      strokeWeight(1);
      rect(x + 2, y + 2, size - 4, size - 4);
      
      // Add corner accents on even tiles
      if (isEven) {
        stroke(0, 150, 180, 60);
        strokeWeight(2);
        // Top-left corner
        line(x, y + 8, x, y);
        line(x, y, x + 8, y);
        // Bottom-right corner
        line(x + size, y + size - 8, x + size, y + size);
        line(x + size - 8, y + size, x + size, y + size);
      }
      
      // Add grid pattern overlay
      stroke(0, 80, 100, 30);
      strokeWeight(1);
      line(x + size/2, y, x + size/2, y + size);
      line(x, y + size/2, x + size, y + size/2);
    }
    else if (pathType == 1) {
      // Start zone - green/teal glow with pulsing effect
      stroke(0, 220, 160);
      strokeWeight(3);
      fill(15, 50, 45);
      rect(x, y, size, size, 4);
      
      // Inner glow
      noFill();
      stroke(0, 255, 180, 100);
      strokeWeight(2);
      rect(x + 4, y + 4, size - 8, size - 8, 2);
      
      // Arrow indicator pointing right
      fill(0, 255, 180);
      noStroke();
      triangle(x + size * 0.3, y + size * 0.3, 
               x + size * 0.3, y + size * 0.7,
               x + size * 0.7, y + size * 0.5);
    }
    else if (pathType == 2) {
      // End zone - red danger with warning style
      stroke(255, 80, 100);
      strokeWeight(3);
      fill(60, 15, 25);
      rect(x, y, size, size, 4);
      
      // Inner warning glow
      noFill();
      stroke(255, 100, 80, 120);
      strokeWeight(2);
      rect(x + 4, y + 4, size - 8, size - 8, 2);
      
      // X mark
      stroke(255, 80, 80);
      strokeWeight(3);
      line(x + size * 0.3, y + size * 0.3, x + size * 0.7, y + size * 0.7);
      line(x + size * 0.7, y + size * 0.3, x + size * 0.3, y + size * 0.7);
    }
    pop()
  }

  // Get all path tile positions (for collision detection)
  getPathTiles() {
    var tiles = [];
    var x = this.x;
    var y = this.y;
    var size = this.size;
    
    // Add start tile
    tiles.push({x: x, y: y, size: size});
    
    // Add all path tiles
    this.path.forEach((p) => {
      if (p == "R") x += size;
      if (p == "L") x -= size;
      if (p == "U") y -= size;
      if (p == "D") y += size;
      tiles.push({x: x, y: y, size: size});
    });
    
    return tiles;
  }
  
  // Check if a point is too close to the path
  isTooCloseToPath(checkX, checkY, minDistance) {
    var tiles = this.getPathTiles();
    var size = this.size;
    
    for (let tile of tiles) {
      // Check distance from point to tile center
      var tileCenterX = tile.x + size / 2;
      var tileCenterY = tile.y + size / 2;
      var distance = dist(checkX, checkY, tileCenterX, tileCenterY);
      
      // Also check if point is inside the tile (with padding)
      var tileMinX = tile.x - minDistance;
      var tileMinY = tile.y - minDistance;
      var tileMaxX = tile.x + size + minDistance;
      var tileMaxY = tile.y + size + minDistance;
      
      if (checkX >= tileMinX && checkX <= tileMaxX && 
          checkY >= tileMinY && checkY <= tileMaxY) {
        return true;
      }
      
      // Check distance to tile edges
      if (distance < size / 2 + minDistance) {
        return true;
      }
    }
    
    return false;
  }

  draw() {
    var x = this.x;
    var y = this.y;
    var size = this.size;
    var index = 0;
    
    // Draw start zone
    this.drawBlock(x - size * 0.25, y - size * 0.25, size * 1.5, 1, -1);
    
    // Draw first tile
    this.drawBlock(x, y, size, 0, index++);
    
    // Draw path tiles
    this.path.forEach((p) => {
      if (p == "R") x += size;
      if (p == "L") x -= size;
      if (p == "U") y -= size;
      if (p == "D") y += size;
      this.drawBlock(x, y, size, 0, index++);
    });
    
    // Draw end zone
    this.drawBlock(x - size * 0.25, y - size * 0.25, size * 1.5, 2, -1);
  }
}

// Space background with stars, nebulae, shooting stars, and slow rockets
class SpaceBackground {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.stars = [];
    this.nebulae = [];
    this.shootingStars = [];
    this.slowRockets = [];  // Persistent slow-moving rockets
    this.time = 0;
    this.lastShootingStar = 0;
    
    this.generateStars();
    this.generateNebulae();
    this.generateSlowRockets();
  }
  
  generateSlowRockets() {
    // Create 3-5 tiny slow-moving rockets that drift across the background
    let rocketCount = Math.floor(random(3, 6));
    for (let i = 0; i < rocketCount; i++) {
      this.slowRockets.push(this.createSlowRocket());
    }
  }
  
  createSlowRocket() {
    let goingRight = random() > 0.5;
    return {
      x: goingRight ? random(-100, -20) : random(this.width + 20, this.width + 100),
      y: random(this.height * 0.05, this.height * 0.6),
      vx: goingRight ? random(0.3, 0.8) : random(-0.8, -0.3),
      vy: random(-0.1, 0.1),
      size: random(2, 4),
      color: [random(180, 255), random(180, 220), random(200, 255)],  // Silvery/white
      trailColor: [random(100, 200), random(150, 255), 255],  // Bluish exhaust
      wobble: random(TWO_PI),
      wobbleSpeed: random(0.01, 0.03)
    };
  }
  
  generateStars() {
    // Create different layers of stars
    // Distant small stars
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: random(this.width),
        y: random(this.height),
        size: random(0.5, 1.5),
        brightness: random(100, 180),
        twinkleSpeed: random(0.02, 0.05),
        twinkleOffset: random(TWO_PI)
      });
    }
    
    // Medium stars
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: random(this.width),
        y: random(this.height),
        size: random(1.5, 2.5),
        brightness: random(180, 230),
        twinkleSpeed: random(0.03, 0.08),
        twinkleOffset: random(TWO_PI),
        color: random() > 0.7 ? [200, 220, 255] : (random() > 0.5 ? [255, 240, 200] : [255, 255, 255])
      });
    }
    
    // Bright stars with glow
    for (let i = 0; i < 15; i++) {
      this.stars.push({
        x: random(this.width),
        y: random(this.height),
        size: random(2, 3),
        brightness: random(230, 255),
        twinkleSpeed: random(0.04, 0.1),
        twinkleOffset: random(TWO_PI),
        hasGlow: true,
        color: random() > 0.6 ? [150, 200, 255] : (random() > 0.5 ? [255, 200, 150] : [200, 150, 255])
      });
    }
  }
  
  spawnShootingStar() {
    // Random chance to spawn different types
    let isRocket = random() > 0.7;
    
    if (isRocket) {
      // Spawn a tiny rocket/spacecraft
      this.shootingStars.push({
        x: random() > 0.5 ? -20 : this.width + 20,
        y: random(this.height * 0.1, this.height * 0.5),
        vx: random() > 0.5 ? random(1, 2) : random(-2, -1),
        vy: random(-0.3, 0.3),
        size: random(3, 5),
        life: 1,
        isRocket: true,
        color: [random(200, 255), random(150, 200), random(50, 100)],
        trailColor: [255, random(100, 200), 0]
      });
    } else {
      // Spawn a shooting star/meteor
      let startSide = random() > 0.5;
      this.shootingStars.push({
        x: startSide ? random(-50, this.width * 0.3) : random(this.width * 0.7, this.width + 50),
        y: random(-20, this.height * 0.3),
        vx: startSide ? random(4, 8) : random(-8, -4),
        vy: random(2, 5),
        size: random(1.5, 3),
        life: 1,
        isRocket: false,
        color: [255, 255, 255],
        trailLength: random(30, 60)
      });
    }
  }
  
  generateNebulae() {
    // Create nebula clouds
    this.nebulae.push({
      x: this.width * 0.2,
      y: this.height * 0.3,
      size: 300,
      color: [80, 20, 100],
      opacity: 15
    });
    
    this.nebulae.push({
      x: this.width * 0.75,
      y: this.height * 0.7,
      size: 250,
      color: [20, 60, 100],
      opacity: 12
    });
    
    this.nebulae.push({
      x: this.width * 0.5,
      y: this.height * 0.15,
      size: 200,
      color: [100, 40, 60],
      opacity: 10
    });
    
    // Smaller accent nebulae
    for (let i = 0; i < 5; i++) {
      this.nebulae.push({
        x: random(this.width),
        y: random(this.height),
        size: random(80, 150),
        color: [
          random([40, 60, 80, 100]),
          random([20, 40, 60]),
          random([80, 100, 120])
        ],
        opacity: random(5, 10)
      });
    }
  }
  
  draw() {
    this.time += 0.016; // Approximate frame time
    
    // Draw base gradient
    this.drawGradientBackground();
    
    // Draw nebulae
    this.drawNebulae();
    
    // Draw stars
    this.drawStars();
    
    // Update and draw slow rockets (always visible, drifting across)
    this.updateSlowRockets();
    this.drawSlowRockets();
    
    // Spawn shooting stars occasionally
    if (this.time - this.lastShootingStar > random(1.5, 4)) {
      this.spawnShootingStar();
      this.lastShootingStar = this.time;
    }
    
    // Update and draw shooting stars
    this.updateShootingStars();
    this.drawShootingStars();
  }
  
  updateSlowRockets() {
    for (let r of this.slowRockets) {
      r.x += r.vx;
      r.y += r.vy + sin(r.wobble) * 0.05;  // Slight wobble
      r.wobble += r.wobbleSpeed;
      
      // Respawn if off screen
      if ((r.vx > 0 && r.x > this.width + 50) || (r.vx < 0 && r.x < -50)) {
        let newRocket = this.createSlowRocket();
        r.x = newRocket.x;
        r.y = newRocket.y;
        r.vx = newRocket.vx;
        r.vy = newRocket.vy;
        r.color = newRocket.color;
        r.trailColor = newRocket.trailColor;
      }
    }
  }
  
  drawSlowRockets() {
    push();
    for (let r of this.slowRockets) {
      this.drawTinyRocket(r);
    }
    pop();
  }
  
  drawTinyRocket(r) {
    push();
    translate(r.x, r.y);
    
    // Rotate to face direction
    let angle = atan2(r.vy, r.vx);
    rotate(angle);
    
    // Soft engine glow trail
    for (let i = 0; i < 12; i++) {
      let t = i / 12;
      let alpha = (1 - t) * 80;
      fill(r.trailColor[0], r.trailColor[1], r.trailColor[2], alpha);
      noStroke();
      let trailX = -r.size - i * 2;
      let trailSize = r.size * 0.6 * (1 - t * 0.7);
      ellipse(trailX, 0, trailSize, trailSize * 0.5);
    }
    
    // Rocket body - simple elongated shape
    fill(r.color[0], r.color[1], r.color[2], 200);
    stroke(255, 255, 255, 80);
    strokeWeight(0.5);
    
    // Tiny rocket shape
    beginShape();
    vertex(r.size * 1.5, 0);  // Nose
    vertex(r.size * 0.3, -r.size * 0.4);
    vertex(-r.size * 0.5, -r.size * 0.3);
    vertex(-r.size * 0.5, r.size * 0.3);
    vertex(r.size * 0.3, r.size * 0.4);
    endShape(CLOSE);
    
    // Tiny window
    fill(150, 200, 255, 180);
    noStroke();
    ellipse(r.size * 0.5, 0, r.size * 0.3, r.size * 0.2);
    
    pop();
  }
  
  updateShootingStars() {
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      let s = this.shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.005;
      
      // Remove if off screen or dead
      if (s.x < -100 || s.x > this.width + 100 || 
          s.y < -100 || s.y > this.height + 100 || 
          s.life <= 0) {
        this.shootingStars.splice(i, 1);
      }
    }
  }
  
  drawShootingStars() {
    push();
    for (let s of this.shootingStars) {
      if (s.isRocket) {
        this.drawRocket(s);
      } else {
        this.drawMeteor(s);
      }
    }
    pop();
  }
  
  drawMeteor(s) {
    // Draw trail
    let trailLength = s.trailLength || 40;
    for (let i = 0; i < trailLength; i++) {
      let t = i / trailLength;
      let alpha = (1 - t) * 150 * s.life;
      let size = s.size * (1 - t * 0.8);
      
      fill(s.color[0], s.color[1], s.color[2], alpha);
      noStroke();
      
      let tx = s.x - s.vx * i * 0.5;
      let ty = s.y - s.vy * i * 0.5;
      ellipse(tx, ty, size, size);
    }
    
    // Draw head
    fill(255, 255, 255, 255 * s.life);
    ellipse(s.x, s.y, s.size * 1.5, s.size * 1.5);
  }
  
  drawRocket(s) {
    push();
    translate(s.x, s.y);
    
    // Rotate to face direction
    let angle = atan2(s.vy, s.vx);
    rotate(angle);
    
    // Engine trail/exhaust
    for (let i = 0; i < 15; i++) {
      let t = i / 15;
      let alpha = (1 - t) * 200 * s.life;
      fill(s.trailColor[0], s.trailColor[1], s.trailColor[2], alpha);
      noStroke();
      let trailX = -s.size * 2 - i * 3;
      let trailSize = s.size * (1 - t * 0.5) * random(0.8, 1.2);
      ellipse(trailX, random(-1, 1), trailSize, trailSize * 0.6);
    }
    
    // Rocket body
    fill(s.color[0], s.color[1], s.color[2], 255 * s.life);
    stroke(255, 255, 255, 100 * s.life);
    strokeWeight(1);
    
    // Simple rocket shape
    beginShape();
    vertex(s.size * 2, 0);  // Nose
    vertex(s.size * 0.5, -s.size * 0.6);  // Top
    vertex(-s.size, -s.size * 0.4);  // Back top
    vertex(-s.size * 1.5, -s.size * 0.8);  // Top fin
    vertex(-s.size, -s.size * 0.3);
    vertex(-s.size, s.size * 0.3);
    vertex(-s.size * 1.5, s.size * 0.8);  // Bottom fin
    vertex(-s.size, s.size * 0.4);  // Back bottom
    vertex(s.size * 0.5, s.size * 0.6);  // Bottom
    endShape(CLOSE);
    
    // Cockpit window
    fill(150, 220, 255, 200 * s.life);
    noStroke();
    ellipse(s.size * 0.8, 0, s.size * 0.6, s.size * 0.4);
    
    pop();
  }
  
  drawGradientBackground() {
    // Create a subtle vertical gradient
    push();
    rectMode(CORNER);
    noStroke();
    for (let y = 0; y < this.height; y += 10) {
      let inter = map(y, 0, this.height, 0, 1);
      let c1 = color(5, 8, 20);
      let c2 = color(15, 12, 25);
      let c = lerpColor(c1, c2, inter);
      fill(c);
      rect(0, y, this.width, 10);
    }
    pop();
  }
  
  drawNebulae() {
    push();
    noStroke();
    for (let nebula of this.nebulae) {
      // Draw multiple layers for soft glow effect
      for (let i = 5; i > 0; i--) {
        let size = nebula.size * (i / 3);
        let opacity = nebula.opacity * (1 - i / 6);
        fill(nebula.color[0], nebula.color[1], nebula.color[2], opacity);
        ellipse(nebula.x, nebula.y, size, size * 0.7);
      }
    }
    pop();
  }
  
  drawStars() {
    push();
    noStroke();
    
    for (let star of this.stars) {
      // Calculate twinkle
      let twinkle = sin(this.time * star.twinkleSpeed * 60 + star.twinkleOffset);
      let brightness = star.brightness + twinkle * 30;
      
      // Draw glow for bright stars
      if (star.hasGlow) {
        let glowColor = star.color || [255, 255, 255];
        fill(glowColor[0], glowColor[1], glowColor[2], 20 + twinkle * 10);
        ellipse(star.x, star.y, star.size * 6, star.size * 6);
        fill(glowColor[0], glowColor[1], glowColor[2], 40 + twinkle * 15);
        ellipse(star.x, star.y, star.size * 3, star.size * 3);
      }
      
      // Draw star
      if (star.color) {
        fill(star.color[0], star.color[1], star.color[2], brightness);
      } else {
        fill(brightness);
      }
      ellipse(star.x, star.y, star.size, star.size);
    }
    pop();
  }
}

// Global background instance
let spaceBackground;


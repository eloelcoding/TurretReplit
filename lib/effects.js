// Projectile class - bullets that travel from turret to enemy
class Projectile {
  constructor(x, y, target, damage, speed, color) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.speed = speed || 8;
    this.color = color || [100, 180, 255];
    this.size = 6 * (config.scale || 1);
    this.alive = true;
    this.trail = [];
    this.maxTrailLength = 10;
  }

  update() {
    if (!this.alive) return;
    
    // If target is dead or gone, remove projectile
    if (!this.target || !this.target.alive) {
      this.alive = false;
      return;
    }

    // Store trail positions
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // Move toward target
    let dx = this.target.x - this.x;
    let dy = this.target.y - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.speed) {
      // Hit the target
      this.target.hit(this.damage);
      this.alive = false;
      return;
    }

    // Normalize and move
    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;
  }

  draw() {
    if (!this.alive) return;

    push();
    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      let alpha = map(i, 0, this.trail.length, 50, 200);
      let size = map(i, 0, this.trail.length, 2, this.size);
      fill(this.color[0], this.color[1], this.color[2], alpha);
      noStroke();
      circle(this.trail[i].x, this.trail[i].y, size);
    }

    // Draw projectile
    fill(this.color[0], this.color[1], this.color[2]);
    noStroke();
    circle(this.x, this.y, this.size);
    
    // Glow effect
    fill(255, 255, 255, 150);
    circle(this.x, this.y, this.size * 0.5);
    pop();
  }
}

// Particle class for death effects
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color || [255, 100, 80];
    this.vx = random(-4, 4);
    this.vy = random(-4, 4);
    this.size = random(4, 12);
    this.life = 1.0;
    this.decay = random(0.02, 0.05);
    this.alive = true;
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(-0.2, 0.2);
  }

  update() {
    if (!this.alive) return;

    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15; // gravity
    this.vx *= 0.98; // friction
    this.life -= this.decay;
    this.rotation += this.rotationSpeed;

    if (this.life <= 0) {
      this.alive = false;
    }
  }

  draw() {
    if (!this.alive) return;

    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    let alpha = this.life * 255;
    let currentSize = this.size * this.life;
    
    // Outer glow
    fill(this.color[0], this.color[1], this.color[2], alpha * 0.3);
    noStroke();
    rect(0, 0, currentSize * 1.5, currentSize * 1.5);
    
    // Main particle
    fill(this.color[0], this.color[1], this.color[2], alpha);
    rect(0, 0, currentSize, currentSize);
    
    // Bright center
    fill(255, 255, 255, alpha * 0.8);
    rect(0, 0, currentSize * 0.4, currentSize * 0.4);
    pop();
  }
}

// Effects manager to handle all projectiles and particles
class EffectsManager {
  constructor() {
    this.projectiles = [];
    this.particles = [];
  }

  addProjectile(x, y, target, damage, speed, color) {
    // Scale speed with the global scale factor
    let scaledSpeed = speed * config.scale;
    this.projectiles.push(new Projectile(x, y, target, damage, scaledSpeed, color));
  }

  spawnDeathEffect(x, y, color) {
    // Spawn multiple particles
    let particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(x, y, color));
    }
    
    // Add some sparks (smaller, faster particles)
    for (let i = 0; i < 8; i++) {
      let spark = new Particle(x, y, [255, 200, 100]);
      spark.vx = random(-6, 6);
      spark.vy = random(-6, 6);
      spark.size = random(2, 5);
      spark.decay = random(0.04, 0.08);
      this.particles.push(spark);
    }
  }

  update() {
    // Update projectiles
    this.projectiles.forEach(p => p.update());
    this.projectiles = this.projectiles.filter(p => p.alive);

    // Update particles
    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => p.alive);
  }

  draw() {
    this.projectiles.forEach(p => p.draw());
    this.particles.forEach(p => p.draw());
  }
}

// Global effects manager instance
let effectsManager;


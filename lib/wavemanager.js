// Wave-based enemy spawning system
class WaveManager {
  constructor(enemyController) {
    this.enemyController = enemyController;
    this.currentWave = 0;
    this.enemiesInWave = 0;
    this.enemiesSpawned = 0;
    this.waveStartTime = 0;
    this.spawnInterval = null;
    this.waveBreakTime = 3000; // 3 seconds between waves
    this.waveBreakStart = 0;
    this.inWaveBreak = false;
  }

  startWave() {
    this.currentWave++;
    this.enemiesInWave = this.calculateEnemiesInWave();
    this.enemiesSpawned = 0;
    this.waveStartTime = millis();
    this.inWaveBreak = false;
    
    // Clear any existing spawn interval
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
    }
    
    // Start spawning enemies for this wave
    this.spawnEnemiesForWave();
  }

  calculateEnemiesInWave() {
    // Wave 1: 5 enemies, increasing by 3 each wave
    // Wave 2: 8, Wave 3: 11, etc.
    return 5 + (this.currentWave - 1) * 3;
  }

  calculateEnemyHealth() {
    // Base health increases with wave
    // Wave 1: 4, Wave 2: 6, Wave 3: 8, etc.
    return 4 + (this.currentWave - 1) * 2;
  }

  calculateSpawnDelay() {
    // Spawn delay decreases slightly with each wave (waves get more intense)
    // Wave 1: 2000ms, Wave 2: 1800ms, Wave 3: 1600ms, min 1000ms
    return max(1000, 2000 - (this.currentWave - 1) * 200);
  }

  getEnemyTypeForWave() {
    // Determine enemy type based on wave number
    // Early waves: mostly BASIC, some FAST
    // Mid waves: mix of BASIC, FAST, TANK
    // Late waves: mix of all types, more ELITE
    
    if (this.currentWave <= 2) {
      // Waves 1-2: 80% BASIC, 20% FAST
      return Math.random() < 0.8 ? "BASIC" : "FAST";
    } else if (this.currentWave <= 5) {
      // Waves 3-5: 50% BASIC, 30% FAST, 20% TANK
      let rand = Math.random();
      if (rand < 0.5) return "BASIC";
      if (rand < 0.8) return "FAST";
      return "TANK";
    } else if (this.currentWave <= 10) {
      // Waves 6-10: 40% BASIC, 25% FAST, 25% TANK, 10% ELITE
      let rand = Math.random();
      if (rand < 0.4) return "BASIC";
      if (rand < 0.65) return "FAST";
      if (rand < 0.9) return "TANK";
      return "ELITE";
    } else {
      // Wave 11+: 30% BASIC, 25% FAST, 25% TANK, 20% ELITE
      let rand = Math.random();
      if (rand < 0.3) return "BASIC";
      if (rand < 0.55) return "FAST";
      if (rand < 0.8) return "TANK";
      return "ELITE";
    }
  }

  spawnEnemiesForWave() {
    const delay = this.calculateSpawnDelay();
    const health = this.calculateEnemyHealth();
    
    // Set enemy health for this wave
    this.enemyController.setEnemyHealth(health);
    
    // Spawn first enemy immediately with random type
    let firstType = this.getEnemyTypeForWave();
    this.enemyController.createEnemy(firstType);
    this.enemiesSpawned++;
    
    // Spawn remaining enemies at intervals
    if (this.enemiesSpawned < this.enemiesInWave) {
      this.spawnInterval = setInterval(() => {
        if (this.enemiesSpawned < this.enemiesInWave) {
          // Randomly select enemy type for this spawn
          let enemyType = this.getEnemyTypeForWave();
          this.enemyController.createEnemy(enemyType);
          this.enemiesSpawned++;
        } else {
          // All enemies spawned for this wave
          clearInterval(this.spawnInterval);
          this.spawnInterval = null;
        }
      }, delay);
    }
  }

  checkWaveComplete() {
    // Check if all enemies in the current wave are dead
    const aliveEnemies = this.enemyController.enemies.filter(e => e.alive).length;
    const allSpawned = this.enemiesSpawned >= this.enemiesInWave;
    
    if (allSpawned && aliveEnemies === 0 && !this.inWaveBreak) {
      // Wave complete! Start break
      this.startWaveBreak();
      return true;
    }
    return false;
  }

  startWaveBreak() {
    this.inWaveBreak = true;
    this.waveBreakStart = millis();
  }

  update() {
    if (this.inWaveBreak) {
      // Check if break time is over
      if (millis() - this.waveBreakStart >= this.waveBreakTime) {
        this.inWaveBreak = false;
        setGameState(GameState.PLAYING);
        this.startWave();
      }
    } else {
      // Check if wave is complete
      this.checkWaveComplete();
    }
  }

  getWaveInfo() {
    return {
      currentWave: this.currentWave,
      enemiesInWave: this.enemiesInWave,
      enemiesSpawned: this.enemiesSpawned,
      enemiesAlive: this.enemyController.enemies.filter(e => e.alive).length,
      inWaveBreak: this.inWaveBreak,
      waveBreakTimeRemaining: this.inWaveBreak ? 
        max(0, this.waveBreakTime - (millis() - this.waveBreakStart)) : 0
    };
  }

  reset() {
    this.currentWave = 0;
    this.enemiesInWave = 0;
    this.enemiesSpawned = 0;
    this.inWaveBreak = false;
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
  }
}


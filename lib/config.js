function populateAsset(assetDictionary, assetLoader) {
  var files = {}
  Object.keys(assetDictionary).map(name => {
    files[name] = assetLoader(assetDictionary[name])
  })
  return files;
}

config = {
  sound: true,
  music: true,
  shadows: false,
  showMousePosition: true,
  keepPlacingTurrets: false,
  defaultFont: "blackops",
  score: 50,
  money: 300,
  enemyHealth: 5,
  
  // Base canvas size (original design)
  baseWidth: 800,
  baseHeight: 550,
  
  // Scale factor - will be calculated in setup()
  scale: 1,
  
  // Calculate scale based on current window size
  updateScale() {
    // Use the smaller ratio to ensure everything fits
    let scaleX = windowWidth / this.baseWidth;
    let scaleY = windowHeight / this.baseHeight;
    this.scale = Math.min(scaleX, scaleY);
    // Apply scale to path size
    this.path.size = Math.round(40 * this.scale);
  },
  
  // Helper to get scaled values
  scaled(value) {
    return value * this.scale;
  },
  // Available maps (base coordinates at 800x550, will be scaled)
  // Padding of 60px from edges, turret positions well away from path
  maps: {
    original: {
      name: "Serpent's Path",
      key: "RRRUUUUUUUURRRRDDDDDDDRRRRRRRUUUULLLLUUUURRRRRR",
      baseX: 60,
      baseY: 440,
      // Turret positions (far from road)
      turrets: [
        { type: "turret", x: 280, y: 220 },
        { type: "safe", x: 500, y: 280 }
      ]
    },
    spiral: {
      name: "The Spiral",
      key: "RRRRRRRRDDDDDDDLLLLLLLLUUUUURRRRRDDDRRRRRRR",
      baseX: 60,
      baseY: 100,
      turrets: [
        { type: "turret", x: 350, y: 320 },
        { type: "safe", x: 500, y: 180 }
      ]
    },
    zigzag: {
      name: "Zigzag Run",
      key: "DDDDDRRRRRRUUUUURRRRRRDDDDDRRRRRRUUUUUURRRRRR",
      baseX: 60,
      baseY: 80,
      turrets: [
        { type: "turret", x: 120, y: 350 },
        { type: "safe", x: 300, y: 450 }
      ]
    },
  },
  currentMap: localStorage.getItem('selectedMap') || "original",
  
  // Path config (will be updated with scaled values)
  path: {
    key: "RRRUUUUUUUUURRRRDDDDDDDDDRRRRRRRRRUUUULLLLLUUUURRRRRRR",
    x: 20,
    y: 480,
    size: 40,
  },
  
  // Function to switch maps
  setMap(mapName) {
    if (this.maps[mapName]) {
      this.currentMap = mapName;
      let map = this.maps[mapName];
      this.path.key = map.key;
      this.path.x = Math.round(map.baseX * this.scale);
      this.path.y = Math.round(map.baseY * this.scale);
      this.path.size = Math.round(40 * this.scale);
    }
  },
  sounds: {
    canon: "assets/sounds/distant-cannon-fire-simulated-36464.mp3",
    boom: "assets/sounds/cinematic-boom-171285.mp3",
    war: "assets/sounds/08. Enanos Guerra Variacion.mp3",
    laser: "assets/sounds/laser-synth.wav",
    nexus: "assets/sounds/nexus-img-main-version-22138-02-54.mp3"
  },
  images: {
    fire: "sprites/fire.svg",
  },
  imageMaps: {
    // Use original PNG sprites (SVGs have sizing issues with p5.js)
    turretMap: ["sprites/TurretMap.png", 3],
    twinGunMap: ["sprites/TwinGunMap.png", 3],
    cannonMap: ["sprites/CannonMap.png", 3],
    safeMap: ["sprites/Safe.png", 1],
    enemyMap: ["sprites/EnemyMap.svg", 3],
  },
  fonts: {
    supercomic: "assets/fonts/SuperComic.ttf",
    blackops: "assets/fonts/BlackOpsOne-Regular.ttf"
  },

  // utility functions
  preload() {
    var imageFiles = populateAsset(config.images, loadImage);
    var soundFiles = populateAsset(config.sounds, loadSound);
    var fontFiles = populateAsset(config.fonts, loadFont);

    var imageMapsFiles = {};
    Object.keys(config.imageMaps).map(name => {
      var record = config.imageMaps[name];
      // var factor = 0.15;
      var image = loadImage(record[0]);
      imageMapsFiles[name] = image;
    })

    // create loaders
    config.setFont = function(name) {
      textFont(fontFiles[name]);
    }

    config.getImage = function(name) {
      return imageFiles[name];
    }

    config.getImageMap = function(name, idx) {
      var image = imageMapsFiles[name];
      var mapSize = config.imageMaps[name][1];
      var width = image.width / mapSize;
      var height = image.height;
      return image.get(width * idx, 0, width, height)
    }

    config.playSound = function(soundName, volume) {
      if (config.sound) {
        var file = soundFiles[soundName];
        file.play(undefined, undefined, volume);
      }
    }

    // Music control
    let currentMusic = null;
    let musicVolume = 0.3;

    config.playMusic = function(soundName, volume = 0.3) {
      currentMusic = soundFiles[soundName];
      musicVolume = volume;
      if (config.music && currentMusic) {
        currentMusic.loop(undefined, undefined, musicVolume);
      }
    }

    config.stopMusic = function() {
      if (currentMusic && currentMusic.isPlaying()) {
        currentMusic.stop();
      }
    }

    config.toggleMusic = function(enabled) {
      config.music = enabled;
      if (currentMusic) {
        if (enabled) {
          if (!currentMusic.isPlaying()) {
            currentMusic.loop(undefined, undefined, musicVolume);
          }
        } else {
          currentMusic.stop();
        }
      }
    }
  },
  addButtons() {
    // Sound effects checkbox - bottom left (on by default)
    let soundBtn = createCheckbox("SFX", true)
    soundBtn.position(10, windowHeight - 35);
    soundBtn.style('color', '#00ffcc');
    soundBtn.style('font-family', 'Orbitron');
    soundBtn.style('font-size', '12px');
    soundBtn.changed(() => config.sound = soundBtn.checked());
    
    // Music checkbox - next to sound (on by default)
    let musicBtn = createCheckbox("Music", true)
    musicBtn.position(70, windowHeight - 35);
    musicBtn.style('color', '#00ffcc');
    musicBtn.style('font-family', 'Orbitron');
    musicBtn.style('font-size', '12px');
    musicBtn.changed(() => config.toggleMusic(musicBtn.checked()));
    
    // Map selector dropdown - bottom left, next to music
    let mapSelect = createSelect();
    mapSelect.position(150, windowHeight - 38);
    mapSelect.style('font-family', 'Orbitron');
    mapSelect.style('background', 'linear-gradient(180deg, #1a2a3a 0%, #0a1520 100%)');
    mapSelect.style('color', '#00ffcc');
    mapSelect.style('border', '2px solid #00aacc');
    mapSelect.style('border-radius', '4px');
    mapSelect.style('padding', '5px 10px');
    mapSelect.style('cursor', 'pointer');
    
    // Add map options
    Object.keys(config.maps).forEach(mapKey => {
      mapSelect.option(config.maps[mapKey].name, mapKey);
    });
    
    mapSelect.selected(config.currentMap);
    mapSelect.changed(() => {
      let selectedMap = mapSelect.value();
      localStorage.setItem('selectedMap', selectedMap);
      // Reload to apply new map
      location.reload();
    });
  },


}
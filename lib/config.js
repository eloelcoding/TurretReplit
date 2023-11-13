config = {
  sound: false,
  shadows: false,
  showMousePosition: true,
  keepPlacingTurrets: false,
  path: {
    key: "RRRUUUUUUUUURRRRDDDDDDDDDRRRRRRRRRUUUULLLLLUUUURRRRRRR",
    x: 20,
    y: 480,
    size: 40,
  },
  sounds: {
    canon: "assets/sounds/distant-cannon-fire-simulated-36464.mp3",
    boom: "assets/sounds/cinematic-boom-171285.mp3",
    war: "assets/sounds/08. Enanos Guerra Variacion.mp3"
  },
  images: {
    cannon: "sprites/cannon.svg",
    turret: "sprites/turret.svg",
    twinGun: "sprites/twinGun.svg",
    fire: "sprites/fire.svg",
    shop: "sprites/Shop2.png",
  },
  imageMaps: {
    turretMap: ["sprites/TurretMap.png", 3],
    twinGunMap: ["sprites/TwinGunMap.png", 3],
    cannonMap: ["sprites/CannonMap.png", 3],
  },

  // utility functions
  preload() {
    config.imageFiles = {}
    Object.keys(config.images).map(name => {
      config.imageFiles[name] = loadImage(config.images[name])
    })

    config.soundFiles = {}
    Object.keys(config.sounds).map(name => {
      config.soundFiles[name] = loadSound(config.sounds[name])
    })

    config.imageMapsFiles = {};
    Object.keys(config.imageMaps).map(name => {
      var record = config.imageMaps[name];
      // var factor = 0.15;
      var image = loadImage(record[0]);
      config.imageMapsFiles[name] = image;
    })

    config.getImageMap = function(name, idx) {
      var image = config.imageMapsFiles[name];
      var mapSize = config.imageMaps[name][1];
      var width = image.width / mapSize;
      var height = image.height;
      return image.get(width * idx, 0, width, height)
    }
  },
  addButtons() {
    button = createCheckbox("Sound", false)
    button.position(200, height + 40);
    button.mousePressed(() => config.sound = !config.sound);
  },
  playSound(soundName, volume, loop = false) {
    if (config.sound) {
      var file = config.soundFiles[soundName];
      if (loop)
        file.loop(undefined, undefined, volume)
      else
        file.play(undefined, undefined, volume)
    }
  },

}
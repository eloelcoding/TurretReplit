function populateAsset(assetDictionary, assetLoader) {
  var files = {}
  Object.keys(assetDictionary).map(name => {
    files[name] = assetLoader(assetDictionary[name])
  })
  return files;
}

config = {
  sound: false,
  shadows: false,
  showMousePosition: true,
  keepPlacingTurrets: false,
  defaultFont: "blackops",
  score: 50,
  money: 300,
  enemyHealth: 5,
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
    fire: "sprites/fire.svg",
    shop: "sprites/Shop2.png",
  },
  imageMaps: {
    turretMap: ["sprites/TurretMap.png", 3],
    twinGunMap: ["sprites/TwinGunMap.png", 3],
    cannonMap: ["sprites/CannonMap.png", 3],
    safeMap: ["sprites/Safe.png", 1]
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

    config.playSound = function(soundName, volume, loop = false) {
      if (config.sound) {
        var file = soundFiles[soundName];
        if (loop)
          file.loop(undefined, undefined, volume)
        else
          file.play(undefined, undefined, volume)
      }
    }
  },
  addButtons() {
    button = createCheckbox("Sound", false)
    button.position(0, height + 16);
    button.mousePressed(() => config.sound = !config.sound);
  },


}
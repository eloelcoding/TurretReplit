config = {
  sound: false,
  path: {
    key: "RRUUUUUUURRRRDDDDRRRRUUUUUUURRRRDDDDDDDDRR",
    x: 20,
    y: 500,
    size: 40,
  },
  sounds: {
    canon: "assets/sounds/distant-cannon-fire-simulated-36464.mp3",
  },
  images: {
    cannon: "sprites/cannon.svg",
    turret: "sprites/turret.svg",
    twinGun: "sprites/twinGun.svg",
    fire: "sprites/fire.svg",
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
  },
  addButtons() {
    button = createCheckbox("Sound", false)
    button.position(400, height + 10);
    button.mousePressed(() => config.sound = !config.sound);
  },
  playSound(soundName) {
    if (config.sound)
      config.soundFiles[soundName].play()
  },

}
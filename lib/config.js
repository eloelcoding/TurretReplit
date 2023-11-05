config = {
  addButtons() {
    button = createCheckbox("Sound", false)
    button.position(400, height + 10);
    button.mousePressed(() => config.sound = !config.sound);
  },
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
  }
}
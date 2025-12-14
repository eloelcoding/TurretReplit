// Game state management
const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
  WAVE_BREAK: 'wave_break'
};

let currentGameState = GameState.MENU;

function setGameState(newState) {
  currentGameState = newState;
}

function getGameState() {
  return currentGameState;
}


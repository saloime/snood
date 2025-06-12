import { gameState, initGame } from './gameState.js';
import { loadLevel } from './gameLogic.js';
import { render } from './renderer.js';
import { setupInput } from './input.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

initGame();
loadLevel(gameState.currentLevel);
setupInput(canvas);

function update() {
    // Update game logic here
    render(ctx);
    requestAnimationFrame(update);
}

update();

import { bubbleColors } from './constants.js';

export const gameState = {
    currentLevel: 0,
    grid: [],
    cannon: {
        x: 0,  // Will be initialized in initGame
        y: 0,
        radius: 26,
        angle: -Math.PI / 2
    },
    currentBubble: null,
    nextBubbleColor: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
    score: 0
};

export function initGame() {
    gameState.cannon.x = canvasWidth / 2;
    gameState.cannon.y = canvasHeight - 40;
};

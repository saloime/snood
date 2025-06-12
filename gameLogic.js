import { gameState, initGame } from './gameState.js';
import { levels } from './levelData.js';
import { bubbleColors, gridRows, gridCols } from './constants.js';
import { gridToPixel, pixelToGrid } from './utils.js';

// === GAME LOGIC ===
function launchBubble() {
    if (currentBubble) return; // Only one at a time
    const angle = cannon.angle;
    const speed = 8;
    currentBubble = {
        x: cannon.x,
        y: cannon.y,
        color: nextBubbleColor,
        velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
        },
    };
    // Prepare next bubble
    nextBubbleColor = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
}

function snapBubbleToGrid(bubble) {
    const { row, col } = pixelToGrid(bubble.x, bubble.y);
    if (
        row >= 0 && row < gridRows &&
        col >= 0 && col < gridCols &&
        !grid[row][col]
    ) {
        grid[row][col] = { color: bubble.color };
        checkMatches(row, col, bubble.color);
        removeFloatingBubbles();
    }
    currentBubble = null;
    // Check win/lose
    if (isGridCleared()) {
        setTimeout(() => {
            alert("Level Complete!");
            currentLevel = (currentLevel + 1) % levels.length;
            loadLevel(currentLevel);
            score += 100;
        }, 300);
    } else if (isGameOver()) {
        setTimeout(() => {
            alert("Game Over!");
            currentLevel = 0;
            score = 0;
            loadLevel(currentLevel);
        }, 300);
    }
}

function isGridCleared() {
    return grid.every(row => row.every(cell => !cell));
}

function isGameOver() {
    // If any bubble is in the last row
    return grid[gridRows - 1].some(cell => cell);
}

function checkMatches(startRow, startCol, color) {
    const visited = Array.from({ length: gridRows }, () => Array(gridCols).fill(false));
    const stack = [[startRow, startCol]];
    const matched = [];

    while (stack.length) {
        const [row, col] = stack.pop();
        if (
            row >= 0 && row < gridRows &&
            col >= 0 && col < gridCols &&
            !visited[row][col] &&
            grid[row][col] &&
            grid[row][col].color === color
        ) {
            visited[row][col] = true;
            matched.push([row, col]);
            // Hex neighbors
            const neighbors = [
                [row, col - 1], [row, col + 1],
                [row - 1, col], [row + 1, col],
                row % 2 === 0
                    ? [row - 1, col - 1]
                    : [row - 1, col + 1],
                row % 2 === 0
                    ? [row + 1, col - 1]
                    : [row + 1, col + 1],
            ];
            for (const [nr, nc] of neighbors) {
                stack.push([nr, nc]);
            }
        }
    }

    if (matched.length >= 3) {
        matched.forEach(([r, c]) => {
            grid[r][c] = null;
        });
        score += matched.length * 10;
    }
}

function removeFloatingBubbles() {
    // Find all bubbles connected to the top row
    const visited = Array.from({ length: gridRows }, () => Array(gridCols).fill(false));
    const stack = [];
    for (let col = 0; col < gridCols; col++) {
        if (grid[0][col]) stack.push([0, col]);
    }
    while (stack.length) {
        const [row, col] = stack.pop();
        if (
            row >= 0 && row < gridRows &&
            col >= 0 && col < gridCols &&
            !visited[row][col] &&
            grid[row][col]
        ) {
            visited[row][col] = true;
            // Hex neighbors
            const neighbors = [
                [row, col - 1], [row, col + 1],
                [row - 1, col], [row + 1, col],
                row % 2 === 0
                    ? [row - 1, col - 1]
                    : [row - 1, col + 1],
                row % 2 === 0
                    ? [row + 1, col - 1]
                    : [row + 1, col + 1],
            ];
            for (const [nr, nc] of neighbors) {
                stack.push([nr, nc]);
            }
        }
    }
    // Remove unvisited bubbles (floating)
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            if (grid[row][col] && !visited[row][col]) {
                grid[row][col] = null;
                score += 20;
            }
        }
    }
}


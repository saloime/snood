// game.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// === CONFIGURATION ===
canvas.width = 640;
canvas.height = 720;

const bubbleRadius = 22;
const gridCols = 10;
const gridRows = 12;
const gridOffsetX = 60;
const gridOffsetY = 60;
const bubbleColors = ["red", "green", "blue", "yellow", "purple", "orange", "cyan", "pink"];

// === LEVELS ===
const levels = [
    // 0 = empty, 1 = red, 2 = green, etc.
    [
        [1, 2, 3, 4, 5, 6, 7, 8, 1, 2],
        [2, 3, 4, 5, 6, 7, 8, 1, 2, 3],
        [3, 4, 5, 6, 7, 8, 1, 2, 3, 4],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    // Add more levels here!
];

let currentLevel = 0;

// === GRID ===
let grid = [];
function loadLevel(levelIdx) {
    grid = Array.from({ length: gridRows }, (_, row) =>
        Array.from({ length: gridCols }, (_, col) => {
            const val = (levels[levelIdx][row] && levels[levelIdx][row][col]) || 0;
            return val > 0 ? { color: bubbleColors[val - 1] } : null;
        })
    );
}
loadLevel(currentLevel);

// === CANNON ===
const cannon = {
    x: canvas.width / 2,
    y: canvas.height - 40,
    radius: 26,
    angle: -Math.PI / 2,
};

let currentBubble = null;
let nextBubbleColor = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
let score = 0;

// === DRAWING ===
function drawCannon() {
    ctx.save();
    ctx.translate(cannon.x, cannon.y);
    ctx.rotate(cannon.angle);
    ctx.fillStyle = "#444";
    ctx.fillRect(-10, -10, 60, 20); // Barrel
    ctx.beginPath();
    ctx.arc(0, 0, cannon.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#222";
    ctx.fill();
    ctx.restore();
    // Draw next bubble
    ctx.beginPath();
    ctx.arc(cannon.x, cannon.y, bubbleRadius, 0, Math.PI * 2);
    ctx.fillStyle = nextBubbleColor;
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.stroke();
}

function drawBubble(bubble) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubbleRadius, 0, Math.PI * 2);
    ctx.fillStyle = bubble.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#444";
    ctx.stroke();
}

function drawGrid() {
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const bubble = grid[row][col];
            if (bubble) {
                const { x, y } = gridToPixel(row, col);
                drawBubble({ ...bubble, x, y });
            }
        }
    }
}

function drawScore() {
    ctx.fillStyle = "#333";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 30, 35);
    ctx.font = "16px Arial";
    ctx.fillText("Level: " + (currentLevel + 1), 520, 35);
}

// === GRID POSITIONING ===
function gridToPixel(row, col) {
    // Hexagonal layout: odd rows are offset
    const x = gridOffsetX + col * bubbleRadius * 2 + (row % 2 ? bubbleRadius : 0);
    const y = gridOffsetY + row * bubbleRadius * 1.75;
    return { x, y };
}

function pixelToGrid(x, y) {
    // Approximate conversion for hex grid
    const row = Math.round((y - gridOffsetY) / (bubbleRadius * 1.75));
    const colOffset = row % 2 ? bubbleRadius : 0;
    const col = Math.round((x - gridOffsetX - colOffset) / (bubbleRadius * 2));
    return { row, col };
}

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

// === GAME LOOP ===
function update() {
    ctx.fillStyle = "#2b2d42";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Playfield background
    ctx.fillStyle = "#c9e7ff";
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    drawCannon();
    drawGrid();
    drawScore();

    if (currentBubble) {
        // Bounce off side walls
        if (
            currentBubble.x - bubbleRadius <= 20 ||
            currentBubble.x + bubbleRadius >= canvas.width - 20
        ) {
            currentBubble.velocity.x *= -1;
        }
        currentBubble.x += currentBubble.velocity.x;
        currentBubble.y += currentBubble.velocity.y;

        // Check collision with grid
        let landed = false;
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                const cell = grid[row][col];
                if (cell) {
                    const { x, y } = gridToPixel(row, col);
                    const dx = currentBubble.x - x;
                    const dy = currentBubble.y - y;
                    if (Math.sqrt(dx * dx + dy * dy) < bubbleRadius * 2 - 2) {
                        landed = true;
                    }
                }
            }
        }
        // Or hit the top
        if (currentBubble.y - bubbleRadius <= gridOffsetY) landed = true;

        if (landed) {
            snapBubbleToGrid(currentBubble);
        } else {
            drawBubble({ ...currentBubble, radius: bubbleRadius });
        }
    }

    requestAnimationFrame(update);
}

// === INPUT ===
function aimCannon(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    let dx = mouseX - cannon.x;
    let dy = mouseY - cannon.y;
    let angle = Math.atan2(dy, dx);
    // Clamp angle between -160deg and -20deg (in radians)
    const min = (-160 * Math.PI) / 180;
    const max = (-20 * Math.PI) / 180;
    cannon.angle = Math.max(min, Math.min(max, angle));
}

canvas.addEventListener("mousemove", aimCannon);
canvas.addEventListener("click", () => {
    if (!currentBubble) launchBubble();
});

update();

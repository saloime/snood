// game.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


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

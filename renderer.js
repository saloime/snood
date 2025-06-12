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

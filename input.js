import { gameState } from './gameState.js';
import { launchBubble } from './gameLogic.js';
import { canvasWidth, canvasHeight } from './constants.js';

export function setupInput(canvas) {
    function aimCannon(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        let dx = mouseX - gameState.cannon.x;
        let dy = mouseY - gameState.cannon.y;
        let angle = Math.atan2(dy, dx);

        const min = (-160 * Math.PI) / 180;
        const max = (-20 * Math.PI) / 180;
        gameState.cannon.angle = Math.max(min, Math.min(max, angle));
    }

    canvas.addEventListener("mousemove", aimCannon);
    canvas.addEventListener("click", () => {
        if (!gameState.currentBubble) launchBubble();
    });
}

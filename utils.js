import { gridOffsetX, gridOffsetY, bubbleRadius } from './constants.js';

export function gridToPixel(row, col) {
    const x = gridOffsetX + col * bubbleRadius * 2 + (row % 2 ? bubbleRadius : 0);
    const y = gridOffsetY + row * bubbleRadius * 1.75;
    return { x, y };
}

export function pixelToGrid(x, y) {
    const row = Math.round((y - gridOffsetY) / (bubbleRadius * 1.75));
    const colOffset = row % 2 ? bubbleRadius : 0;
    const col = Math.round((x - gridOffsetX - colOffset) / (bubbleRadius * 2));
    return { row, col };
}

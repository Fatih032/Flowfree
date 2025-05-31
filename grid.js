// scripts/grid.js
import { logDebug } from './debug.js';

export function createGrid(gameContainer, gridSize) {
    const cells = [];
    gameContainer.innerHTML = '';
    gameContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gameContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.row = Math.floor(i / gridSize);
        cell.dataset.col = i % gridSize;
        cell.dataset.hasPoint = 'false';
        cell.dataset.pathColorIndex = '-1';
        cell.dataset.pointColor = '';
        cells.push(cell);
        gameContainer.appendChild(cell);
    }
    logDebug("Izgara oluşturuldu.");
    return cells;
}

export function placePoints(numPairs, pointColors, cells) {
    cells.forEach(cell => {
        cell.className = 'grid-cell';
        cell.dataset.hasPoint = 'false';
        cell.dataset.pathColorIndex = '-1';
        cell.dataset.pointColor = '';
    });

    let availableCells = [...cells];
    const currentPoints = [];

    for (let i = 0; i < numPairs; i++) {
        const pointColorClass = pointColors[i];
        const pathColorIdx = i;

        const randomIndex1 = Math.floor(Math.random() * availableCells.length);
        const point1 = availableCells[randomIndex1];
        availableCells.splice(randomIndex1, 1);

        const randomIndex2 = Math.floor(Math.random() * availableCells.length);
        const point2 = availableCells[randomIndex2];
        availableCells.splice(randomIndex2, 1);

        point1.classList.add(pointColorClass, 'point');
        point1.dataset.hasPoint = 'true';
        point1.dataset.colorIndex = pathColorIdx.toString();
        point1.dataset.pointColor = pointColorClass;

        point2.classList.add(pointColorClass, 'point');
        point2.dataset.hasPoint = 'true';
        point2.dataset.colorIndex = pathColorIdx.toString();
        point2.dataset.pointColor = pointColorClass;

        currentPoints.push({ point1, point2, colorIndex: pathColorIdx });
    }
    logDebug(`${numPairs} çift nokta yerleştirildi.`);
    return currentPoints;
}
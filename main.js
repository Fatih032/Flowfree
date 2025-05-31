// scripts/main.js
import { createGrid, placePoints } from './grid.js';
import { handlePathStart, handlePathDrawing, checkPath } from './path.js';
import { checkAllPathsCompleted } from './level.js';
import { handleUndo } from './undo.js';
import { initializeScore, updateScore, displayScore } from './score.js';
import { logDebug } from './debug.js';

const gameContainer = document.getElementById('game-container');
const undoButton = document.getElementById('undoButton');
const gridSize = 10;
let currentLevel = 2;
let activeColorIndex = -1;
let currentPath = [];
let isDrawing = false;
let completedPaths = {};
let cells = [];
let score = 0;
let lastTouchTime = 0; // Debounce için
let lastTouchedCell = null; // Aynı hücreyi tekrar algılamayı önlemek

const pointColors = [
    'point-color-0', 'point-color-1', 'point-color-2', 'point-color-3', 'point-color-4'
];
const pathColors = [
    'path-color-0', 'path-color-1', 'path-color-2', 'path-color-3', 'path-color-4'
];

function startGame() {
    cells = createGrid(gameContainer, gridSize);
    placePoints(currentLevel, pointColors, cells);
    completedPaths = {};
    currentPath = [];
    activeColorIndex = -1;
    isDrawing = false;
    score = initializeScore();
    displayScore(score);
    lastTouchedCell = null; // Oyunu sıfırlarken temizle
    logDebug("Oyun başlatıldı.");
}

function addEventListeners() {
    gameContainer.addEventListener('mousedown', (e) => {
        const targetCell = e.target;
        if (!targetCell?.classList.contains('grid-cell')) {
            if (isDrawing) {
                isDrawing = false;
                logDebug("[FARE] Oyun alanı dışına tıklandı, çizim durduruldu.");
            }
            return;
        }
        handlePathStart(targetCell, "[FARE]", { activeColorIndex, currentPath, pointColors, pathColors }, (newState) => {
            activeColorIndex = newState.activeColorIndex;
            currentPath = newState.currentPath;
            isDrawing = newState.isDrawing;
        });
    });

    gameContainer.addEventListener('mouseover', (e) => {
        if (!isDrawing) return;
        const currentCell = e.target;
        if (!currentCell?.classList.contains('grid-cell')) return;
        handlePathDrawing(currentCell, activeColorIndex, currentPath, pathColors, (newState) => {
            activeColorIndex = newState.activeColorIndex;
            currentPath = newState.currentPath;
            isDrawing = newState.isDrawing;
        });
    });

    document.addEventListener('mouseup', () => {
        if (isDrawing) {
            isDrawing = false;
            checkPath(currentPath, activeColorIndex, completedPaths, pathColors, (newState) => {
                activeColorIndex = newState.activeColorIndex;
                currentPath = newState.currentPath;
                if (newState.pathCompleted) {
                    score = updateScore(score, 'complete_path', 100);
                    displayScore(score);
                }
                checkAllPathsCompleted(completedPaths, currentLevel, pointColors, startGame);
            });
            logDebug("[FARE] Çizim durduruldu.");
        }
    });

    gameContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const targetCell = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!targetCell?.classList.contains('grid-cell')) {
            if (isDrawing) {
                isDrawing = false;
                logDebug("[DOKUNMATİK] Oyun alanı dışına dokunuldu, çizim durduruldu.");
            }
            return;
        }
        handlePathStart(targetCell, "[DOKUNMATİK]", { activeColorIndex, currentPath, pointColors, pathColors }, (newState) => {
            activeColorIndex = newState.activeColorIndex;
            currentPath = newState.currentPath;
            isDrawing = newState.isDrawing;
            lastTouchedCell = targetCell; // Başlangıç hücresini kaydet
        });
    });

    gameContainer.addEventListener('touchmove', (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const now = Date.now();
        if (now - lastTouchTime < 100) return; // 100ms debounce
        lastTouchTime = now;

        const touch = e.touches[0];
        const currentCell = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!currentCell?.classList.contains('grid-cell')) {
            logDebug("[DOKUNMATİK] Geçersiz hücre algılandı, çizim devam ediyor.");
            return;
        }
        if (currentCell === lastTouchedCell) {
            logDebug("[DOKUNMATİK] Aynı hücre tekrar algılandı, işlem atlanıyor.");
            return;
        }
        logDebug(`[DOKUNMATİK] Dokunulan hücre: Row ${currentCell.dataset.row}, Col ${currentCell.dataset.col}`);
        handlePathDrawing(currentCell, activeColorIndex, currentPath, pathColors, (newState) => {
            activeColorIndex = newState.activeColorIndex;
            currentPath = newState.currentPath;
            isDrawing = newState.isDrawing;
            lastTouchedCell = currentCell; // Son dokunulan hücreyi güncelle
        });
    });

    document.addEventListener('touchend', () => {
        if (isDrawing) {
            isDrawing = false;
            checkPath(currentPath, activeColorIndex, completedPaths, pathColors, (newState) => {
                activeColorIndex = newState.activeColorIndex;
                currentPath = newState.currentPath;
                if (newState.pathCompleted) {
                    score = updateScore(score, 'complete_path', 100);
                    displayScore(score);
                }
                checkAllPathsCompleted(completedPaths, currentLevel, pointColors, startGame);
            });
            logDebug("[DOKUNMATİK] Çizim durduruldu.");
            lastTouchedCell = null; // Çizim bittiğinde sıfırla
            if (navigator.vibrate) navigator.vibrate(50);
        }
    });

    undoButton.addEventListener('click', () => {
        handleUndo(currentPath, activeColorIndex, completedPaths, pathColors, (newState) => {
            activeColorIndex = newState.activeColorIndex;
            currentPath = newState.currentPath;
            completedPaths = newState.completedPaths;
        });
    });

    logDebug("Olay dinleyicileri eklendi.");
}

document.addEventListener('DOMContentLoaded', () => {
    startGame();
    addEventListeners();
});
// scripts/level.js
import { logDebug } from './debug.js';

export function checkAllPathsCompleted(completedPaths, currentLevel, pointColors, startGame) {
    if (Object.keys(completedPaths).length === currentLevel) {
        logDebug(`Seviye ${currentLevel} tamamlandı!`);
        alert(`Tebrikler! Seviye ${currentLevel} tamamlandı!`);
        currentLevel = Math.min(currentLevel + 1, pointColors.length);
        if (currentLevel > pointColors.length) {
            alert('Tüm seviyeleri tamamladınız! Oyun başa dönüyor.');
            currentLevel = 2;
        }
        startGame();
    }
}
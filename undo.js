// scripts/undo.js
import { logDebug } from './debug.js';
import { resetPathVisuals } from './path.js';

export function handleUndo(currentPath, activeColorIndex, completedPaths, pathColors, callback) {
    let newCurrentPath = currentPath;
    let newActiveColorIndex = activeColorIndex;
    let newCompletedPaths = { ...completedPaths };

    if (currentPath.length > 0) {
        const lastCell = newCurrentPath.pop();
        if (lastCell.dataset.hasPoint === 'false') {
            lastCell.classList.remove(pathColors[activeColorIndex]);
            lastCell.dataset.pathColorIndex = '-1';
        }
        logDebug(`Yarım kalan yol geri alındı: Son hücre (Row: ${lastCell.dataset.row}, Col: ${lastCell.dataset.col}).`);
        if (newCurrentPath.length === 0) newActiveColorIndex = -1;
        callback({ activeColorIndex: newActiveColorIndex, currentPath: newCurrentPath, completedPaths: newCompletedPaths });
        return;
    }

    const pathColorIndexes = Object.keys(completedPaths);
    if (pathColorIndexes.length > 0) {
        const lastColorIndex = pathColorIndexes[pathColorIndexes.length - 1];
        const pathToRemove = completedPaths[lastColorIndex];
        resetPathVisuals(pathToRemove, parseInt(lastColorIndex), pathColors);
        delete newCompletedPaths[lastColorIndex];
        logDebug(`Son tamamlanan yol (Renk: ${lastColorIndex}) geri alındı.`);
    } else {
        logDebug("Geri alınacak yol yok.");
    }

    callback({ activeColorIndex: newActiveColorIndex, currentPath: newCurrentPath, completedPaths: newCompletedPaths });
}
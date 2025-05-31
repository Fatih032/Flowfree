// scripts/path.js
import { logDebug } from './debug.js';

export function handlePathStart(targetCell, inputType, state, callback) {
    const { activeColorIndex, currentPath, pointColors, pathColors } = state;
    const isPoint = targetCell.dataset.hasPoint === 'true';
    const pointColorIndex = isPoint ? parseInt(targetCell.dataset.colorIndex) : -1;
    const isPath = targetCell.dataset.pathColorIndex !== '-1';
    const pathColorIndex = isPath ? parseInt(targetCell.dataset.pathColorIndex) : -1;

    let newActiveColorIndex = activeColorIndex;
    let newCurrentPath = currentPath;
    let newIsDrawing = false;

    if (currentPath.length > 0 && currentPath.includes(targetCell) && pathColorIndex === parseInt(currentPath[0].dataset.pathColorIndex)) {
        if (newActiveColorIndex === -1) newActiveColorIndex = pathColorIndex;
        const clickIndexInPath = currentPath.indexOf(targetCell);
        if (clickIndexInPath < currentPath.length - 1) {
            logDebug(`${inputType} Yarım kalan yol üzerinden devam ediliyor.`);
            for (let i = currentPath.length - 1; i > clickIndexInPath; i--) {
                const cellToRemove = currentPath[i];
                cellToRemove.classList.remove(pathColors[newActiveColorIndex]);
                cellToRemove.dataset.pathColorIndex = '-1';
            }
            newCurrentPath = currentPath.slice(0, clickIndexInPath + 1);
        }
        newIsDrawing = true;
    } else if (isPoint) {
        newActiveColorIndex = pointColorIndex;
        newIsDrawing = true;

        if (currentPath.length > 0 && currentPath[0] !== targetCell) {
            logDebug(`${inputType} Yeni noktaya (${pointColorIndex}) başlandı.`);
            resetPathVisuals(currentPath, parseInt(currentPath[0].dataset.pathColorIndex), pathColors);
            newCurrentPath = [];
        } else if (currentPath.length > 0 && currentPath[0] === targetCell && newActiveColorIndex === pointColorIndex) {
            logDebug(`${inputType} Başlangıç noktasına tekrar basıldı.`);
            resetPathVisuals(currentPath, newActiveColorIndex, pathColors);
            newCurrentPath = [];
            newActiveColorIndex = -1;
            newIsDrawing = false;
            callback({ activeColorIndex: newActiveColorIndex, currentPath: newCurrentPath, isDrawing: newIsDrawing });
            return;
        }

        targetCell.classList.add(pathColors[newActiveColorIndex]);
        targetCell.dataset.pathColorIndex = newActiveColorIndex.toString();
        newCurrentPath.push(targetCell);
        logDebug(`${inputType} Başlangıç noktası: Renk ${newActiveColorIndex}.`);
    } else if (newIsDrawing) {
        newIsDrawing = false;
        logDebug(`${inputType} Boş hücreye tıklandı.`);
    }

    callback({ activeColorIndex: newActiveColorIndex, currentPath: newCurrentPath, isDrawing: newIsDrawing });
}

export function handlePathDrawing(currentCell, colorIndex, pathArray, pathColors, callback) {
    const lastCell = pathArray[pathArray.length - 1];
    const existingIndex = pathArray.indexOf(currentCell);
    let newActiveColorIndex = colorIndex;
    let newPathArray = pathArray;
    let newIsDrawing = true;

    if (currentCell === lastCell) {
        logDebug("Aynı hücreye dokunuldu, işlem atlanıyor.");
        callback({ activeColorIndex: newActiveColorIndex, currentPath: newPathArray, isDrawing: newIsDrawing });
        return;
    }

    if (existingIndex !== -1 && existingIndex < pathArray.length - 1) {
        logDebug("Geriye doğru gidiliyor.");
        for (let i = pathArray.length - 1; i > existingIndex; i--) {
            const cellToRemove = pathArray[i];
            if (cellToRemove.dataset.hasPoint === 'false') {
                cellToRemove.classList.remove(pathColors[colorIndex]);
                cellToRemove.dataset.pathColorIndex = '-1';
            }
        }
        newPathArray = pathArray.slice(0, existingIndex + 1);
        callback({ activeColorIndex: newActiveColorIndex, currentPath: newPathArray, isDrawing: newIsDrawing });
        return;
    }

    if (currentCell.dataset.hasPoint === 'true' && parseInt(currentCell.dataset.colorIndex) !== colorIndex) {
        logDebug("Kural İhlali: Farklı renkte bir noktaya ulaşıldı.");
        newIsDrawing = false;
        resetPathVisuals(pathArray, colorIndex, pathColors);
        newPathArray = [];
        newActiveColorIndex = -1;
        callback({ activeColorIndex: newActiveColorIndex, currentPath: newPathArray, isDrawing: newIsDrawing });
        return;
    }
    if (currentCell.dataset.pathColorIndex !== '-1' && parseInt(currentCell.dataset.pathColorIndex) !== colorIndex) {
        logDebug("Kural İhlali: Başka bir yolun üzerinden geçildi.");
        newIsDrawing = false;
        resetPathVisuals(pathArray, colorIndex, pathColors);
        newPathArray = [];
        newActiveColorIndex = -1;
        callback({ activeColorIndex: newActiveColorIndex, currentPath: newPathArray, isDrawing: newIsDrawing });
        return;
    }

    if (lastCell && isAdjacent(lastCell, currentCell)) {
        currentCell.classList.add(pathColors[colorIndex]);
        currentCell.dataset.pathColorIndex = colorIndex.toString();
        newPathArray.push(currentCell);
        logDebug(`Hücre eklendi - Row: ${currentCell.dataset.row}, Col: ${currentCell.dataset.col}`);
    } else if (lastCell) {
        logDebug(`Kural İhlali: Bitişik olmayan hücreye geçildi. Son hücre: Row ${lastCell.dataset.row}, Col ${lastCell.dataset.col}; Yeni hücre: Row ${currentCell.dataset.row}, Col ${currentCell.dataset.col}`);
        newIsDrawing = true; // Çizimi durdurmak yerine devam et
    }

    callback({ activeColorIndex: newActiveColorIndex, currentPath: newPathArray, isDrawing: newIsDrawing });
}

export function checkPath(currentPath, activeColorIndex, completedPaths, pathColors, callback) {
    if (currentPath.length === 0) {
        logDebug("Yol boş, kontrol edilmiyor.");
        callback({ activeColorIndex, currentPath, pathCompleted: false });
        return;
    }

    const startPointCell = currentPath[0];
    const endPointCell = currentPath[currentPath.length - 1];
    const startColorIndex = parseInt(startPointCell.dataset.colorIndex);
    const isEndPoint = endPointCell.dataset.hasPoint === 'true';
    const endColorIndex = isEndPoint ? parseInt(endPointCell.dataset.colorIndex) : -1;

    let newActiveColorIndex = activeColorIndex;
    let newCurrentPath = currentPath;
    let pathCompleted = false;

    if (startPointCell.dataset.hasPoint !== 'true' || startColorIndex !== activeColorIndex) {
        logDebug("Kural İhlali: Yol başlangıcı hatalı.");
        resetPathVisuals(currentPath, activeColorIndex, pathColors);
        newCurrentPath = [];
        newActiveColorIndex = -1;
        callback({ activeColorIndex: newActiveColorIndex, currentPath: newCurrentPath, pathCompleted });
        return;
    }

    if (isEndPoint && endColorIndex === activeColorIndex && startPointCell !== endPointCell) {
        let pathIsValid = true;
        for (let i = 0; i < currentPath.length - 1; i++) {
            if (!isAdjacent(currentPath[i], currentPath[i + 1])) {
                pathIsValid = false;
                logDebug(`Kural İhlali: Bitişik olmayan hücreler var. Hücre ${i}: Row ${currentPath[i].dataset.row}, Col ${currentPath[i].dataset.col}; Hücre ${i+1}: Row ${currentPath[i+1].dataset.row}, Col ${currentPath[i+1].dataset.col}`);
                break;
            }
        }

        if (pathIsValid) {
            completedPaths[activeColorIndex] = [...currentPath];
            logDebug(`Renk ${activeColorIndex} için yol tamamlandı!`);
            newCurrentPath = [];
            newActiveColorIndex = -1;
            pathCompleted = true;
            if (navigator.vibrate) navigator.vibrate(100);
        } else {
            logDebug("Kural İhlali: Geçersiz yol.");
            resetPathVisuals(currentPath, activeColorIndex, pathColors);
            newCurrentPath = [];
            newActiveColorIndex = -1;
        }
    } else {
        logDebug("Yol tamamlanmadı, devam edilebilir.");
    }

    callback({ activeColorIndex: newActiveColorIndex, currentPath: newCurrentPath, pathCompleted });
}

export function resetPathVisuals(pathCells, colorIndex, pathColors) {
    if (!pathCells?.length || colorIndex === -1) return;
    pathCells.forEach(cell => {
        if (parseInt(cell.dataset.pathColorIndex) === colorIndex && cell.dataset.hasPoint === 'false') {
            cell.classList.remove(pathColors[colorIndex]);
            cell.dataset.pathColorIndex = '-1';
        }
    });
    logDebug(`Yol görseli temizlendi (Renk: ${colorIndex}).`);
}

export function isAdjacent(cell1, cell2) {
    const row1 = parseInt(cell1.dataset.row);
    const col1 = parseInt(cell1.dataset.col);
    const row2 = parseInt(cell2.dataset.row);
    const col2 = parseInt(cell2.dataset.col);
    const isAdjacent = (row1 === row2 && Math.abs(col1 - col2) === 1) || (col1 === col2 && Math.abs(row1 - row2) === 1);
    return isAdjacent;
}
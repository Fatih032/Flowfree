// scripts/score.js
import { logDebug } from './debug.js';

export function initializeScore() {
    const score = 0;
    logDebug("Puanlama sistemi başlatıldı.");
    return score;
}

export function updateScore(score, action, value) {
    let newScore = score;
    if (action === 'complete_path') {
        newScore += value;
        logDebug(`Puan güncellendi: +${value} (Yol tamamlandı). Toplam: ${newScore}`);
    }
    return newScore;
}

export function displayScore(score, elementId = 'score-display') {
    const scoreElement = document.getElementById(elementId);
    if (scoreElement) {
        scoreElement.textContent = `Puan: ${score}`;
    }
}
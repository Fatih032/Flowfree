// scripts/debug.js
export function logDebug(message) {
    const debugOutput = document.getElementById('debug-output');
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    if (debugOutput) {
        debugOutput.innerHTML += `<div style="font-size: 0.8em; color: #555;">[${time}] ${message}</div>`;
        debugOutput.scrollTop = debugOutput.scrollHeight;
    }
    console.log(`[${time}] ${message}`);
}
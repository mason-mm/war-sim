import { CanvasRenderer } from "./ui/canvasRenderer.js";
import { InputHandler } from "./ui/inputHandler.js";
import { processMovement } from "./sim/moveSystem.js";
import { gameState } from "./core/gameState.js";

const renderer = new CanvasRenderer('map');

function formatClockTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map(value => String(value).padStart(2, '0'))
        .join(':');
}

document.addEventListener('DOMContentLoaded', () => {
    const input = new InputHandler(document.getElementById('map'), renderer);
    const selectionText = document.getElementById('selection-text');
    const clockElement = document.getElementById('clock');

    clockElement.innerText = formatClockTime(gameState.settings.time);

    document.getElementById('btn-move').addEventListener('click', () => {
        if (gameState.selectedUnitId) {
            gameState.isPlacingWaypoint = true;
            selectionText.innerText = "DESIGNATE DESTINATION...";
        }
    });

    document.getElementById('btn-cancel').addEventListener('click', () => {
        const selectedUnit = gameState.units.find(unit => unit.id === gameState.selectedUnitId);

        if (!selectedUnit) {
            return;
        }

        gameState.isPlacingWaypoint = false;
        selectedUnit.order = null;
        selectedUnit.status = 'IDLE';

        input.updateUI({ type: 'unit', entity: selectedUnit });
        selectionText.innerText = 'ORDERS CANCELED.';
        renderer.draw();
    });

    renderer.draw();

    setInterval(() => {
        //sim tick
        processMovement(renderer);
        renderer.toggleBlink();
    }, gameState.settings.tickInterval);

    setInterval(() => {
        gameState.settings.time += 1;
        clockElement.innerText = formatClockTime(gameState.settings.time);
    }, 1000);
});

function animate() {
    //animate the pulses

    //bases
    gameState.settings.ui.basePulseRadius += 0.5;
    if (gameState.settings.ui.basePulseRadius > gameState.settings.baseDetectionRange) {
        gameState.settings.ui.basePulseRadius = 0;
    }

    //units
    gameState.settings.ui.unitPulseRadius += 0.5;
    if (gameState.settings.ui.unitPulseRadius > gameState.settings.unitDetectionRange) {
        gameState.settings.ui.unitPulseRadius = 0;
    }

    renderer.draw();
    requestAnimationFrame(animate);
}

animate();

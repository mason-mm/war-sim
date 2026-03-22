import { gameState } from "../core/gameState.js";

export function processMovement(renderer) {
    let needsRedraw = false;

    gameState.units.forEach(unit => {
        //check if they have to move order
        if (unit.order && unit.order.type === 'MOVE') {
            const targetX = unit.order.x;
            const targetY = unit.order.y;

            //calculate distance to target
            const dx = targetX - unit.x;
            const dy = targetY - unit.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            //if we are close to the target, snap there and clear the order
            if (distance <= unit.speed) {
                unit.x = targetX;
                unit.y = targetY;
                unit.order = null;
                unit.status = 'IDLE';
            } else {
                unit.x += (dx / distance) * unit.speed;
                unit.y += (dy / distance) * unit.speed;
                unit.status = 'MOVING';
            }

            needsRedraw = true;
        }
    });

    const selectedUnit = gameState.units.find(unit => unit.id === gameState.selectedUnitId);
    const statusElement = document.getElementById('stat-value-3');
    const taskElement = document.getElementById('stat-value-2');
    const positionElement = document.getElementById('stat-value-4');

    if (selectedUnit && statusElement) {
        statusElement.innerText = selectedUnit.status.toUpperCase();
    }

    if (selectedUnit && taskElement) {
        taskElement.innerText = selectedUnit.order && selectedUnit.order.type ? selectedUnit.order.type : 'NONE';
    }

    if (selectedUnit && positionElement) {
        positionElement.innerText = `${Math.round(selectedUnit.x)}, ${Math.round(selectedUnit.y)}`;
    }

    if (needsRedraw) {
        renderer.draw();
    }
}

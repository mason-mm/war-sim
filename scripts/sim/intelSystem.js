import { gameState } from "../core/gameState.js";

export function isLocationVisible(targetX, targetY) {
    //check friendly bases
    const visibleByBase = gameState.world.bases.some(base => {
        if (base.faction !== 'friendly') {
            return false;
        }
        const dist = Math.hypot(targetX - base.x, targetY - base.y);
        return dist < gameState.settings.baseDetectionRange;
    });
    if (visibleByBase) {
        return true;
    }

    //check friendly units
    const visibleByUnit = gameState.units.some(unit => {
        if (unit.faction !== 'friendly') {
            return false;
        }
        const dist = Math.hypot(targetX - unit.x, targetY - unit.y);
        return dist < gameState.settings.unitDetectionRange;
    });
    return visibleByUnit;
}

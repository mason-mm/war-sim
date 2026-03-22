import { gameState } from "../core/gameState.js";

export class InputHandler {
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;

        this.canvas.addEventListener('mousedown', (e) => this.handlePointClick(e));
    }

    handlePointClick(e) {
        const rect  = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        //check for each of the states
        if (gameState.isPlacingWaypoint && gameState.selectedUnitId) {
            //waypoint
            const unit = gameState.units.find(u => u.id === gameState.selectedUnitId);
            if (unit) {
                const worldX = (mouseX / this.canvas.width)  * gameState.world.width;
                const worldY = (mouseY / this.canvas.height) * gameState.world.height;

                //set the order
                unit.order = { type: 'MOVE', x: worldX, y: worldY };
                gameState.isPlacingWaypoint = false;
                this.updateUI({ type: 'unit', entity: unit });
                
                //update the status text
                document.getElementById('selection-text').innerText = 'WAYPOINT SET. PROCEEDING.';
            }
        } else {
            let foundUnit = null;
            let foundBase = null;
            const unitHitRadius = 20;
            const baseHitRadiusX = (gameState.settings.baseSize.width + 8) / 2;
            const baseHitRadiusY = (gameState.settings.baseSize.height + 8) / 2;

            gameState.units.forEach(unit => {
                if (unit.faction === 'friendly') {
                    const screenPos = this.renderer.worldToScreen(unit.x, unit.y);
                    const dist      = Math.hypot(mouseX - screenPos.x, mouseY - screenPos.y);

                    if (dist < unitHitRadius) {
                        foundUnit = unit;
                    }
                }
            });

            gameState.world.bases.forEach(base => {
                if (base.faction === 'friendly') {
                    const screenPos = this.renderer.worldToScreen(base.x, base.y);
                    const insideBaseX = Math.abs(mouseX - screenPos.x) <= baseHitRadiusX;
                    const insideBaseY = Math.abs(mouseY - screenPos.y) <= baseHitRadiusY;

                    if (insideBaseX && insideBaseY) {
                        foundBase = base;
                    }
                }
            });

            if (foundBase) {
                gameState.selectedBaseId = foundBase.id;
                gameState.selectedUnitId = null;
                gameState.isPlacingWaypoint = false;
                this.updateUI({ type: 'base', entity: foundBase });
            } else if (foundUnit) {
                gameState.selectedUnitId = foundUnit.id;
                gameState.selectedBaseId = null;
                this.updateUI({ type: 'unit', entity: foundUnit });
            } else {
                gameState.selectedUnitId = null;
                gameState.selectedBaseId = null;
                gameState.isPlacingWaypoint = false;
                this.updateUI(null);
            }
        }

        //force a redraw to see the box around the unit
        this.renderer.draw();
    }

    updateUI(selection) {
        //get elements
        const infoHeader = document.querySelector('#unit-info h3');
        const selectionText = document.getElementById('selection-text');
        const statsPanel = document.getElementById('stats-display');
        const orderPanel = document.getElementById('order-panel');
        const statLabel1 = document.getElementById('stat-label-1');
        const statLabel2 = document.getElementById('stat-label-2');
        const statLabel3 = document.getElementById('stat-label-3');
        const statLabel4 = document.getElementById('stat-label-4');
        const statValue1 = document.getElementById('stat-value-1');
        const statValue2 = document.getElementById('stat-value-2');
        const statValue3 = document.getElementById('stat-value-3');
        const statValue4 = document.getElementById('stat-value-4');

        if (selection?.type === 'unit') {
            const unit = selection.entity;

            //show the orders panel
            infoHeader.innerText = `SQUAD: ${unit.id.toUpperCase()}`;
            selectionText.innerText = 'Squad selected. Awaiting command input.';
            statsPanel.classList.remove('hidden');
            orderPanel.classList.remove('hidden');

            //update the stats to be accurate
            statLabel1.innerText = 'SUPPLIES';
            statLabel2.innerText = 'TASK';
            statLabel3.innerText = 'STATUS';
            statLabel4.innerText = 'POSITION';

            statValue1.innerText = `${unit.supplies}%`;
            statValue2.innerText = unit.order && unit.order.type ? unit.order.type : 'NONE';
            statValue3.innerText = unit.status.toUpperCase();
            statValue4.innerText = `${Math.round(unit.x)}, ${Math.round(unit.y)}`;
        } else if (selection?.type === 'base') {
            const base = selection.entity;

            infoHeader.innerText = `BASE: ${base.id.toUpperCase()}`;
            selectionText.innerText = 'Base selected. Reviewing logistics and sensor coverage.';
            statsPanel.classList.remove('hidden');
            orderPanel.classList.add('hidden');

            statLabel1.innerText = 'FACTION';
            statLabel2.innerText = 'SUPPLIES';
            statLabel3.innerText = 'DETECTION';
            statLabel4.innerText = 'POSITION';

            statValue1.innerText = base.faction.toUpperCase();
            statValue2.innerText = `${base.supplies}`;
            statValue3.innerText = `${gameState.settings.baseDetectionRange}M`;
            statValue4.innerText = `${Math.round(base.x)}, ${Math.round(base.y)}`;
        } else {
            //hide the orders panel
            infoHeader.innerText = "SYSTEM READY";
            selectionText.innerText = 'Select a squad or base on the map to issue command overrides.';
            statsPanel.classList.add('hidden');
            orderPanel.classList.add('hidden');
        }
    }
}

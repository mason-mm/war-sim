import { gameState } from "../core/gameState.js";
import { isLocationVisible } from "../sim/intelSystem.js";

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx    = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.blinkVisible = true;
    }

    resize() {
        this.canvas.width  = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    worldToScreen(worldX, worldY) {
        const screenX = (worldX / gameState.world.width)  * this.canvas.width;
        const screenY = (worldY / gameState.world.height) * this.canvas.height;
        return { x: screenX, y: screenY };
    }

    draw() {
        //clear the screen
        this.ctx.fillStyle = '#000800';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();

        //configure the phosphor effect
        this.ctx.shadowBlur  = 10;
        this.ctx.fillStyle   = '#33ff33';
        this.ctx.shadowColor = '#33ff33';

        this.drawRadarPulses();

        //draw bases
        gameState.world.bases.forEach(base => {
            const pos = this.worldToScreen(base.x, base.y);

            this.setCtxToFactionColor(base.faction);

            //draw the shape
            this.ctx.fillRect  (pos.x - 10, pos.y - 10, gameState.settings.baseSize.width,     gameState.settings.baseSize.height);
            this.ctx.strokeRect(pos.x - 12, pos.y - 12, gameState.settings.baseSize.width + 4, gameState.settings.baseSize.height + 4);
        });

        //draw units
        if (this.blinkVisible) {
            gameState.units.forEach(unit => {
                const canSee = unit.faction === 'friendly' || isLocationVisible(unit.x, unit.y);

                if (canSee) {
                    const pos = this.worldToScreen(unit.x, unit.y);

                    this.setCtxToFactionColor(unit.faction);

                    //draw the circle
                    this.ctx.beginPath();
                    this.ctx.arc(pos.x, pos.y, gameState.settings.unitRadius, 0, Math.PI * 2);
                    this.ctx.fill();

                    //draw movement paths
                    if (unit.order && unit.order.type === 'MOVE') {
                        const start = this.worldToScreen(unit.x, unit.y);
                        const end   = this.worldToScreen(unit.order.x, unit.order.y);


                        this.ctx.strokeStyle = 'rgba(51, 255, 51, 0.3)';
                        this.ctx.setLineDash([5, 5]);

                        this.ctx.beginPath();

                        this.ctx.moveTo(start.x, start.y);
                        this.ctx.lineTo(end.x, end.y);

                        this.ctx.stroke();

                        this.ctx.setLineDash([]);
                    }
                }
            });

            //draw the box around the selected asset
            if (gameState.selectedUnitId || gameState.selectedBaseId) {
                let pos = null;
                let size = 15;
                let edge = 5;

                if (gameState.selectedUnitId) {
                    const selectedUnit = gameState.units.find(u => u.id === gameState.selectedUnitId);
                    if (selectedUnit) {
                        pos = this.worldToScreen(selectedUnit.x, selectedUnit.y);
                    }
                } else if (gameState.selectedBaseId) {
                    const selectedBase = gameState.world.bases.find(base => base.id === gameState.selectedBaseId);
                    if (selectedBase) {
                        pos = this.worldToScreen(selectedBase.x, selectedBase.y);
                        size = 18;
                        edge = 7;
                    }
                }

                if (pos) {
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth   = 2;

                    //draw the 4 corners
                    this.ctx.beginPath();

                    //top left
                    this.ctx.moveTo(pos.x - size, pos.y - size + edge);
                    this.ctx.lineTo(pos.x - size, pos.y - size);
                    this.ctx.lineTo(pos.x - size + edge, pos.y - size);

                    //top right
                    this.ctx.moveTo(pos.x + size - edge, pos.y - size);
                    this.ctx.lineTo(pos.x + size, pos.y - size);
                    this.ctx.lineTo(pos.x + size, pos.y - size + edge);

                    //bottom left
                    this.ctx.moveTo(pos.x - size, pos.y + size - edge);
                    this.ctx.lineTo(pos.x - size, pos.y + size);
                    this.ctx.lineTo(pos.x - size + edge, pos.y + size);

                    //bottom right
                    this.ctx.moveTo(pos.x + size - edge, pos.y + size);
                    this.ctx.lineTo(pos.x + size, pos.y + size);
                    this.ctx.lineTo(pos.x + size, pos.y + size - edge);

                    this.ctx.setLineDash([2, 2]);
                    this.ctx.stroke();
                    this.ctx.setLineDash([]);
                }
            }
        }

        this.ctx.shadowBlur = 0;
    };

    drawRadarPulses() {
        const basePulse = gameState.settings.ui.basePulseRadius;
        const unitPulse = gameState.settings.ui.unitPulseRadius;
        let opacity;

        this.ctx.lineWidth = 2;

        //draw base pulses
        opacity = 1 - (basePulse / gameState.settings.baseDetectionRange);
        gameState.world.bases.forEach(base => {
            if (base.faction === 'friendly') {
                const pos = this.worldToScreen(base.x, base.y);

                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, (basePulse / gameState.world.width) * this.canvas.width, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });

        //draw unit pulses
        opacity = 1 - (unitPulse / gameState.settings.unitDetectionRange);
        gameState.units.forEach(unit => {
            if (unit.faction === 'friendly') {
                const pos = this.worldToScreen(unit.x, unit.y);

                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, (unitPulse / gameState.world.width) * this.canvas.width, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(51, 255, 51, 0.05)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += gameState.settings.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gameState.settings.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    toggleBlink() {
        this.blinkVisible = !this.blinkVisible;
    }

    setCtxToFactionColor(faction) {
        this.ctx.fillStyle   = faction === 'friendly' ? '#33ff33' : '#ff3333';
        this.ctx.shadowColor = this.ctx.fillStyle;
    }
};

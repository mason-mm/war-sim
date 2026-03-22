export const gameState = {
    settings: {
        time: 0,
        tickInterval: 700,

        baseSize: {
            width: 20,
            height: 20
        },

        unitDetectionRange: 45,
        baseDetectionRange: 100,

        unitRadius: 6,

        gridSize: 50,

        ui: {
            basePulseRadius: 0,
            unitPulseRadius: 0
        }
    },

    selectedUnitId: null,
    selectedBaseId: null,

    world: {
        width: 1000,
        height: 1000,

        bases: [
            { id: 'b1', faction: 'friendly', x: 200, y: 200, supplies: 1000 }
        ]
    },

    units: [
        {
            id: 'u1',
            faction: 'friendly',
            x: 250,
            y: 250,
            speed: 20,
            status: "IDLE",
            supplies: 100,
            order: "NONE"
        },
        {
            id: 'u2',
            faction: 'friendly',
            x: 300,
            y: 350,
            speed: 20,
            status: "IDLE",
            supplies: 80,
            order: "NONE"
        },
        {
            id: 'u3',
            faction: 'enemy',
            x: 500,
            y: 500,
            speed: 20,
            status: 'IDLE',
            supplies: 65,
            order: "NONE"
        }
    ]
};

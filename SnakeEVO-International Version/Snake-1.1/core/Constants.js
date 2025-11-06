export const GRID_SIZE = 20;
export const CELL_SIZE = 25;
export const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
export const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE;

export const INITIAL_SNAKE_LENGTH = 3;
export const INITIAL_SPEED = 150;

export const DIRECTION = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

export const EVOLUTION_STAGES = [
    {
        name: 'Base',
        minLength: 0,
        maxLength: 10,
        color: '#4CAF50',
        speed: 150,
        description: 'Basic green snake'
    },
    {
        name: 'Growing',
        minLength: 11,
        maxLength: 25,
        color: '#2196F3',
        speed: 130,
        description: 'Blue evolution'
    },
    {
        name: 'Aware',
        minLength: 26,
        maxLength: 50,
        color: '#1B5E20',
        speed: 110,
        description: 'Dark green evolution'
    },
    {
        name: 'Powered',
        minLength: 51,
        maxLength: 75,
        color: '#F44336',
        speed: 90,
        description: 'Red evolution'
    },
    {
        name: 'Legendary',
        minLength: 76,
        maxLength: Infinity,
        color: '#FFD700',
        speed: 70,
        description: 'Golden legendary'
    }
];

export const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover',
    LEADERBOARD: 'leaderboard'
};

export const POINTS_PER_FOOD = 10;

export const INPUT_DEBOUNCE_MS = 50;

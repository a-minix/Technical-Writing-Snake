import { GRID_SIZE } from '../core/Constants.js';

export default class Food {
    constructor() {
        this.position = null;
        this.spawn();
    }

    spawn(excludePositions = []) {
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            this.position = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            attempts++;
        } while (
            attempts < maxAttempts &&
            this.isPositionOccupied(excludePositions)
        );
    }

    isPositionOccupied(positions) {
        return positions.some(
            pos => pos.x === this.position.x && pos.y === this.position.y
        );
    }

    getPosition() {
        return this.position;
    }
}

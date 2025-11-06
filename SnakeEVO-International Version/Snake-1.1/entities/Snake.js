import { DIRECTION, INITIAL_SNAKE_LENGTH, GRID_SIZE } from '../core/Constants.js';

export default class Snake {
    constructor() {
        this.reset();
    }

    reset() {
        const startX = Math.floor(GRID_SIZE / 2);
        const startY = Math.floor(GRID_SIZE / 2);
        
        this.segments = [];
        for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
            this.segments.push({ x: startX - i, y: startY });
        }
        
        this.direction = DIRECTION.RIGHT;
        this.nextDirection = DIRECTION.RIGHT;
        this.growing = false;
    }

    getHead() {
        return this.segments[0];
    }

    getLength() {
        return this.segments.length;
    }

    setDirection(newDirection) {
        const head = this.getHead();
        const neck = this.segments[1];
        
        const newHead = {
            x: head.x + newDirection.x,
            y: head.y + newDirection.y
        };
        
        if (neck && newHead.x === neck.x && newHead.y === neck.y) {
            return;
        }
        
        this.nextDirection = newDirection;
    }

    move() {
        this.direction = this.nextDirection;
        
        const head = this.getHead();
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        this.segments.unshift(newHead);
        
        if (!this.growing) {
            this.segments.pop();
        } else {
            this.growing = false;
        }
    }

    grow() {
        this.growing = true;
    }

    checkSelfCollision() {
        const head = this.getHead();
        
        for (let i = 1; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }

    checkWallCollision() {
        const head = this.getHead();
        return (
            head.x < 0 ||
            head.x >= GRID_SIZE ||
            head.y < 0 ||
            head.y >= GRID_SIZE
        );
    }
}

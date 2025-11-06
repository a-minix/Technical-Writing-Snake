import { DIRECTION, INPUT_DEBOUNCE_MS } from '../core/Constants.js';
import EventBus from '../events/EventBus.js';

export default class InputManager {
    constructor() {
        this.lastInputTime = 0;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    handleKeyboard(event) {
        const now = Date.now();
        if (now - this.lastInputTime < INPUT_DEBOUNCE_MS) {
            return;
        }

        let direction = null;

        switch (event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                direction = DIRECTION.UP;
                event.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                direction = DIRECTION.DOWN;
                event.preventDefault();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                direction = DIRECTION.LEFT;
                event.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                direction = DIRECTION.RIGHT;
                event.preventDefault();
                break;
        }

        if (direction) {
            this.lastInputTime = now;
            EventBus.emit('direction-change', direction);
        }
    }

    handleTouchStart(event) {
        if (event.touches.length === 0) return;
        
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }

    handleTouchEnd(event) {
        if (event.changedTouches.length === 0) return;
        
        const now = Date.now();
        if (now - this.lastInputTime < INPUT_DEBOUNCE_MS) {
            return;
        }

        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;

        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;

        const minSwipeDistance = 30;
        
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            return;
        }

        let direction = null;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
        } else {
            direction = deltaY > 0 ? DIRECTION.DOWN : DIRECTION.UP;
        }

        if (direction) {
            this.lastInputTime = now;
            EventBus.emit('direction-change', direction);
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyboard);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
}

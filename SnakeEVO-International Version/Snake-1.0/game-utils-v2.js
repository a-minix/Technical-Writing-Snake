const GameState = {
    MENU: 'MENU',
    INIT: 'INIT',
    PLAYER_INPUT: 'PLAYER_INPUT',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER',
    ERROR: 'ERROR'
};

const Direction = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
};

class StateManager {
    constructor() {
        this.currentState = GameState.MENU;
        this.lockState = false;
        this.stateTransitionQueue = [];
        this.stateHistory = [];
        this.validTransitions = new Map([
            [GameState.MENU, [GameState.INIT]],
            [GameState.INIT, [GameState.PLAYER_INPUT]],
            [GameState.PLAYER_INPUT, [GameState.PLAYING]],
            [GameState.PLAYING, [GameState.PAUSED, GameState.GAMEOVER]],
            [GameState.PAUSED, [GameState.PLAYING, GameState.MENU]],
            [GameState.GAMEOVER, [GameState.MENU]]
        ]);
    }

    async transitionState(newState, context = {}) {
        while (this.lockState) {
            await this.sleep(1);
        }

        this.lockState = true;

        try {
            if (!this.isValidTransition(this.currentState, newState)) {
                console.warn(`Invalid state transition: ${this.currentState} -> ${newState}`);
                return false;
            }

            const previousState = this.currentState;
            this.currentState = newState;
            this.stateHistory.push({ from: previousState, to: newState, timestamp: Date.now() });

            console.log(`State transition: ${previousState} -> ${newState}`);
            return true;
        } catch (error) {
            console.error('State transition error:', error);
            this.currentState = GameState.ERROR;
            return false;
        } finally {
            this.lockState = false;

            if (this.stateTransitionQueue.length > 0) {
                const next = this.stateTransitionQueue.shift();
                this.transitionState(next.newState, next.context);
            }
        }
    }

    queueTransition(newState, context = {}) {
        if (this.lockState) {
            this.stateTransitionQueue.push({ newState, context });
        } else {
            this.transitionState(newState, context);
        }
    }

    isValidTransition(from, to) {
        return this.validTransitions.get(from)?.includes(to) ?? false;
    }

    getCurrentState() {
        return this.currentState;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class SpatialHashGrid {
    constructor(gridSize = 20) {
        this.gridSize = gridSize;
        this.grid = new Map();
    }

    getCellKey(x, y) {
        return `${x},${y}`;
    }

    insert(point, data) {
        const key = this.getCellKey(point.x, point.y);
        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }
        this.grid.get(key).push({ ...point, ...data });
    }

    query(x, y) {
        const key = this.getCellKey(x, y);
        return this.grid.get(key) || [];
    }

    clear() {
        this.grid.clear();
    }

    rebuild(snakeSegments) {
        this.clear();
        snakeSegments.forEach((seg, idx) => {
            this.insert(seg, {
                type: idx === 0 ? 'HEAD' : 'BODY',
                index: idx
            });
        });
    }
}

class OptimizedCollisionDetector {
    constructor() {
        this.spatialHash = new SpatialHashGrid();
        this.fallbackMode = false;
    }

    checkSelfCollision(snakeHead, snakeSegments) {
        if (snakeSegments.length <= 4) return false;

        try {
            this.spatialHash.rebuild(snakeSegments);
            const neighbors = this.getAdjacentCells(snakeHead);

            for (const cell of neighbors) {
                const items = this.spatialHash.query(cell.x, cell.y);
                for (const item of items) {
                    if (item.index > 3 && item.type === 'BODY') {
                        if (item.x === snakeHead.x && item.y === snakeHead.y) {
                            return true;
                        }
                    }
                }
            }
            return false;
        } catch (error) {
            console.error('Spatial hash error, using fallback:', error);
            return this.checkSelfCollisionFallback(snakeHead, snakeSegments);
        }
    }

    checkSelfCollisionFallback(snakeHead, snakeSegments) {
        for (let i = 4; i < snakeSegments.length; i++) {
            const seg = snakeSegments[i];
            if (seg.x === snakeHead.x && seg.y === snakeHead.y) {
                return true;
            }
        }
        return false;
    }

    getAdjacentCells(point) {
        const cells = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                cells.push({ x: point.x + dx, y: point.y + dy });
            }
        }
        return cells;
    }

    checkWallCollision(head, gridSize = 20) {
        return head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
    }
}

class InputValidationPipeline {
    constructor() {
        this.lastInputTime = 0;
        this.debounceMs = 50;
        this.inputQueue = [];
        this.maxQueueSize = 3;
        this.currentDirection = { x: 1, y: 0 };
        this.opposites = new Map([
            ['UP', 'DOWN'],
            ['DOWN', 'UP'],
            ['LEFT', 'RIGHT'],
            ['RIGHT', 'LEFT']
        ]);
    }

    processInput(direction) {
        const now = Date.now();
        
        if (now - this.lastInputTime < this.debounceMs) {
            return { valid: false, reason: 'Rate limited' };
        }

        if (this.queue.length >= this.maxQueueSize) {
            return { valid: false, reason: 'Queue full' };
        }

        if (!this.isValidDirection(direction)) {
            return { valid: false, reason: '180-degree turn not allowed' };
        }

        if (this.inputQueue.length > 0 && 
            this.inputQueue[this.inputQueue.length - 1].x === direction.x &&
            this.inputQueue[this.inputQueue.length - 1].y === direction.y) {
            return { valid: false, reason: 'Duplicate direction' };
        }

        this.inputQueue.push(direction);
        this.lastInputTime = now;
        return { valid: true };
    }

    isValidDirection(newDir) {
        return !(newDir.x === -this.currentDirection.x && newDir.y === -this.currentDirection.y);
    }

    getNextInput() {
        if (this.inputQueue.length > 0) {
            const input = this.inputQueue.shift();
            this.currentDirection = input;
            return input;
        }
        return null;
    }

    reset() {
        this.inputQueue = [];
        this.lastInputTime = 0;
        this.currentDirection = { x: 1, y: 0 };
    }
}

class SecureStorageManager {
    saveWithChecksum(key, data) {
        try {
            const dataStr = JSON.stringify(data);
            const checksum = this.calculateChecksum(dataStr);
            
            const envelope = {
                data,
                checksum,
                timestamp: Date.now(),
                version: '2.0'
            };

            const backupKey = `${key}_backup`;
            const existing = localStorage.getItem(key);
            if (existing) {
                localStorage.setItem(backupKey, existing);
            }

            localStorage.setItem(key, JSON.stringify(envelope));
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            return false;
        }
    }

    loadWithValidation(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;

            const envelope = JSON.parse(raw);
            const dataStr = JSON.stringify(envelope.data);
            const computedChecksum = this.calculateChecksum(dataStr);

            if (computedChecksum !== envelope.checksum) {
                console.error('Checksum mismatch - attempting recovery');
                return this.attemptRecovery(key);
            }

            return envelope.data;
        } catch (error) {
            console.error('Load failed:', error);
            return this.attemptRecovery(key);
        }
    }

    attemptRecovery(key) {
        const backupKey = `${key}_backup`;
        try {
            const backup = localStorage.getItem(backupKey);
            if (backup) {
                console.log('Recovered from backup');
                const envelope = JSON.parse(backup);
                return envelope.data || JSON.parse(backup);
            }
        } catch (e) {
            console.error('Recovery failed');
        }
        return null;
    }

    calculateChecksum(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
}

class PerformanceProfiler {
    constructor() {
        this.measurements = new Map();
        this.maxSamples = 300;
        this.frameStart = 0;
    }

    startFrame() {
        this.frameStart = performance.now();
    }

    endFrame() {
        const duration = performance.now() - this.frameStart;
        this.record('frame_total', duration);
    }

    measureSection(label, fn) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        this.record(label, duration);
        return result;
    }

    record(label, duration) {
        if (!this.measurements.has(label)) {
            this.measurements.set(label, []);
        }
        const samples = this.measurements.get(label);
        samples.push(duration);
        if (samples.length > this.maxSamples) {
            samples.shift();
        }
    }

    getStats() {
        const stats = {};
        for (const [label, times] of this.measurements) {
            if (times.length === 0) continue;
            
            const sorted = [...times].sort((a, b) => a - b);
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const p50 = sorted[Math.floor(sorted.length * 0.5)];
            const p95 = sorted[Math.floor(sorted.length * 0.95)];
            const max = Math.max(...times);

            stats[label] = {
                avg: avg.toFixed(2),
                p50: p50.toFixed(2),
                p95: p95.toFixed(2),
                max: max.toFixed(2),
                samples: times.length
            };
        }
        return stats;
    }

    estimateFPS() {
        const frameTimes = this.measurements.get('frame_total');
        if (!frameTimes || frameTimes.length === 0) return 0;
        
        const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        return Math.round(1000 / avgFrameTime);
    }

    getReport() {
        return {
            fps: this.estimateFPS(),
            stats: this.getStats()
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameState,
        Direction,
        StateManager,
        SpatialHashGrid,
        OptimizedCollisionDetector,
        InputValidationPipeline,
        SecureStorageManager,
        PerformanceProfiler
    };
}

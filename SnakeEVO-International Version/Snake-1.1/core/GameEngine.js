import Snake from '../entities/Snake.js';
import Food from '../entities/Food.js';
import EvolutionSystem from '../systems/EvolutionSystem.js';
import InputManager from '../systems/InputManager.js';
import AudioManager from '../systems/AudioManager.js';
import HighScoreRepository from '../storage/HighScoreRepository.js';
import EventBus from '../events/EventBus.js';
import Logger from '../utils/Logger.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE, POINTS_PER_FOOD } from './Constants.js';

export default class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        
        this.snake = new Snake();
        this.food = new Food();
        this.evolution = new EvolutionSystem();
        this.inputManager = new InputManager();
        this.audioManager = new AudioManager();
        this.highScoreRepo = new HighScoreRepository();
        
        this.score = 0;
        this.playerName = '';
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoopId = null;
        this.lastUpdateTime = 0;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        EventBus.on('direction-change', (direction) => {
            if (this.isRunning && !this.isPaused) {
                this.snake.setDirection(direction);
            }
        });
        
        this.audioManager.setupEventListeners();
    }

    start(playerName) {
        this.playerName = playerName || 'Anonymous';
        this.reset();
        this.isRunning = true;
        this.isPaused = false;
        this.audioManager.init();
        this.lastUpdateTime = Date.now();
        this.gameLoop();
        Logger.info('Game started');
    }

    reset() {
        this.snake.reset();
        this.food.spawn(this.snake.segments);
        this.evolution.reset();
        this.score = 0;
    }

    pause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused && this.isRunning) {
            this.lastUpdateTime = Date.now();
            this.gameLoop();
        }
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
    }

    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        const currentStage = this.evolution.getCurrentStage();
        
        if (deltaTime >= currentStage.speed) {
            this.update();
            this.lastUpdateTime = currentTime;
        }
        
        this.render();
        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.snake.move();
        
        if (this.snake.checkWallCollision() || this.snake.checkSelfCollision()) {
            this.gameOver();
            return;
        }
        
        const head = this.snake.getHead();
        const foodPos = this.food.getPosition();
        
        if (head.x === foodPos.x && head.y === foodPos.y) {
            this.snake.grow();
            this.score += POINTS_PER_FOOD;
            this.food.spawn(this.snake.segments);
            
            EventBus.emit('food-eaten', { score: this.score });
            
            this.evolution.updateStage(this.snake.getLength());
        }
    }

    render() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        this.renderGrid();
        this.renderFood();
        this.renderSnake();
    }

    renderGrid() {
        this.ctx.strokeStyle = '#2a2a3e';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= CANVAS_WIDTH; x += CELL_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, CANVAS_HEIGHT);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= CANVAS_HEIGHT; y += CELL_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(CANVAS_WIDTH, y);
            this.ctx.stroke();
        }
    }

    renderFood() {
        const food = this.food.getPosition();
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.beginPath();
        this.ctx.arc(
            food.x * CELL_SIZE + CELL_SIZE / 2,
            food.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    renderSnake() {
        const currentStage = this.evolution.getCurrentStage();
        
        this.snake.segments.forEach((segment, index) => {
            const isHead = index === 0;
            
            if (isHead) {
                this.ctx.fillStyle = currentStage.color;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = currentStage.color;
            } else {
                this.ctx.fillStyle = this.lightenColor(currentStage.color, index * 2);
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.fillRect(
                segment.x * CELL_SIZE + 1,
                segment.y * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
            );
        });
        
        this.ctx.shadowBlur = 0;
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    gameOver() {
        this.stop();
        
        const currentStage = this.evolution.getCurrentStage();
        const result = this.highScoreRepo.saveScore(this.playerName, this.score, currentStage.name);
        
        EventBus.emit('game-over', {
            score: this.score,
            stage: currentStage.name,
            rank: result.rank,
            isTopScore: result.isTopScore
        });
        
        Logger.info(`Game Over - Score: ${this.score}, Stage: ${currentStage.name}`);
    }

    getScore() {
        return this.score;
    }

    getStage() {
        return this.evolution.getCurrentStage();
    }

    getPlayerName() {
        return this.playerName;
    }
}

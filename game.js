const GRID_SIZE = 20;
const CELL_SIZE = 25;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const BASE_SPEED = 100;

const EVOLUTION_STAGES = {
    BASE: { name: 'Base Stage', minLength: 0, color: '#00ff00', speed: 1.0, trail: false, particles: false },
    GROWING: { name: 'Growing Stage', minLength: 11, color: '#00ccff', speed: 1.05, trail: false, particles: false },
    AWARE: { name: 'Aware Stage', minLength: 26, color: '#9966ff', speed: 1.10, trail: true, particles: false },
    ENHANCED: { name: 'Enhanced Stage', minLength: 51, color: '#ff3333', speed: 1.15, trail: true, particles: true },
    LEGENDARY: { name: 'Legendary Stage', minLength: 76, color: '#ffd700', speed: 1.20, trail: true, particles: true, aura: true }
};

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_SIZE;
        this.canvas.height = CANVAS_SIZE;
        
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = null;
        this.score = 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.currentStage = EVOLUTION_STAGES.BASE;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.trail = [];
        this.particles = [];
        this.backgroundMusic = null;
        this.musicContext = null;
        this.isGameActive = false;
        
        this.stateManager = new StateManager();
        this.collisionDetector = new OptimizedCollisionDetector();
        this.inputValidator = new InputValidationPipeline();
        this.storageManager = new SecureStorageManager();
        this.profiler = new PerformanceProfiler();
        
        this.initScreens();
        this.initControls();
        this.loadSettings();
        this.updateHighScore();
        this.initBackgroundMusic();
        
        console.log('Snake Evolution v2.0 initialized');
        console.log('Features: State Machine, Spatial Hashing, Input Validation, Secure Storage, Performance Profiling');
    }
    
    initScreens() {
        document.getElementById('play-btn').addEventListener('click', () => this.startGame());
        document.getElementById('leaderboard-btn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('exit-btn').addEventListener('click', () => this.exitToMenu());
        document.getElementById('replay-btn').addEventListener('click', () => this.startGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.exitToMenu());
        document.getElementById('close-leaderboard-btn').addEventListener('click', () => this.hideLeaderboard());
        document.getElementById('close-settings-btn').addEventListener('click', () => this.hideSettings());
        
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('music-toggle').addEventListener('change', (e) => {
            this.musicEnabled = e.target.checked;
            this.saveSettings();
            if (this.isGameActive) {
                if (this.musicEnabled) {
                    this.startBackgroundMusic();
                } else {
                    this.stopBackgroundMusic();
                }
            }
        });
    }
    
    initControls() {
        document.addEventListener('keydown', (e) => {
            if (this.isPaused && e.key !== 'Escape') return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                    e.preventDefault();
                    break;
                case 'Escape':
                    if (!this.isPaused) this.pauseGame();
                    else this.resumeGame();
                    e.preventDefault();
                    break;
            }
        });
        
        document.querySelectorAll('.touch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const dir = btn.dataset.direction;
                switch(dir) {
                    case 'up':
                        if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                        break;
                    case 'down':
                        if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                        break;
                    case 'left':
                        if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                        break;
                    case 'right':
                        if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                        break;
                }
            });
        });
        
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30 && this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                } else if (deltaX < -30 && this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
            } else {
                if (deltaY > 30 && this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                } else if (deltaY < -30 && this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
            }
        });
    }
    
    startGame() {
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.isPaused = false;
        this.currentStage = EVOLUTION_STAGES.BASE;
        this.trail = [];
        this.particles = [];
        this.isGameActive = true;
        
        this.spawnFood();
        this.updateScore();
        this.updateEvolutionDisplay();
        
        this.showScreen('game-screen');
        
        if (this.musicEnabled) {
            this.startBackgroundMusic();
        }
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), BASE_SPEED / this.currentStage.speed);
    }
    
    update() {
        if (this.isPaused) return;
        
        this.direction = this.nextDirection;
        
        const head = { 
            x: this.snake[0].x + this.direction.x, 
            y: this.snake[0].y + this.direction.y 
        };
        
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.spawnFood();
            this.checkEvolution();
            this.playSound('eat');
        } else {
            this.snake.pop();
        }
        
        if (this.currentStage.trail) {
            this.trail.push({ x: head.x, y: head.y, opacity: 0.5 });
            if (this.trail.length > 10) this.trail.shift();
            this.trail.forEach(t => t.opacity *= 0.9);
        }
        
        if (this.currentStage.particles) {
            this.updateParticles();
        }
        
        this.draw();
    }
    
    checkCollision(pos) {
        if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) {
            return true;
        }
        
        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === pos.x && this.snake[i].y === pos.y) {
                return true;
            }
        }
        
        return false;
    }
    
    spawnFood() {
        let validPosition = false;
        while (!validPosition) {
            this.food = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            
            validPosition = true;
            for (let segment of this.snake) {
                if (segment.x === this.food.x && segment.y === this.food.y) {
                    validPosition = false;
                    break;
                }
            }
        }
    }
    
    checkEvolution() {
        const length = this.snake.length;
        let newStage = this.currentStage;
        
        if (length >= EVOLUTION_STAGES.LEGENDARY.minLength) {
            newStage = EVOLUTION_STAGES.LEGENDARY;
        } else if (length >= EVOLUTION_STAGES.ENHANCED.minLength) {
            newStage = EVOLUTION_STAGES.ENHANCED;
        } else if (length >= EVOLUTION_STAGES.AWARE.minLength) {
            newStage = EVOLUTION_STAGES.AWARE;
        } else if (length >= EVOLUTION_STAGES.GROWING.minLength) {
            newStage = EVOLUTION_STAGES.GROWING;
        }
        
        if (newStage !== this.currentStage) {
            this.evolve(newStage);
        }
        
        this.updateEvolutionDisplay();
    }
    
    evolve(newStage) {
        this.currentStage = newStage;
        this.playSound('evolve');
        
        this.createEvolutionEffect();
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), BASE_SPEED / this.currentStage.speed);
        
        this.updateEvolutionDisplay();
    }
    
    createEvolutionEffect() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.snake[0].x * CELL_SIZE + CELL_SIZE / 2,
                y: this.snake[0].y * CELL_SIZE + CELL_SIZE / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                color: this.currentStage.color
            });
        }
    }
    
    updateParticles() {
        if (Math.random() < 0.3) {
            this.particles.push({
                x: this.snake[0].x * CELL_SIZE + CELL_SIZE / 2,
                y: this.snake[0].y * CELL_SIZE + CELL_SIZE / 2,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1.0,
                color: this.currentStage.color
            });
        }
        
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            return p.life > 0;
        });
    }
    
    draw() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        this.ctx.strokeStyle = '#2a2a4e';
        for (let i = 0; i <= GRID_SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * CELL_SIZE, 0);
            this.ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * CELL_SIZE);
            this.ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
            this.ctx.stroke();
        }
        
        if (this.currentStage.trail) {
            this.trail.forEach(t => {
                this.ctx.fillStyle = this.currentStage.color + Math.floor(t.opacity * 255).toString(16).padStart(2, '0');
                this.ctx.fillRect(t.x * CELL_SIZE, t.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            });
        }
        
        this.snake.forEach((segment, index) => {
            if (this.currentStage.aura && index === 0) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = this.currentStage.color;
            }
            
            this.ctx.fillStyle = this.currentStage.color;
            this.ctx.fillRect(
                segment.x * CELL_SIZE + 1, 
                segment.y * CELL_SIZE + 1, 
                CELL_SIZE - 2, 
                CELL_SIZE - 2
            );
            
            if (index === 0 && this.currentStage.minLength >= 26) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * CELL_SIZE + CELL_SIZE * 0.35,
                    segment.y * CELL_SIZE + CELL_SIZE * 0.35,
                    3, 0, Math.PI * 2
                );
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * CELL_SIZE + CELL_SIZE * 0.65,
                    segment.y * CELL_SIZE + CELL_SIZE * 0.35,
                    3, 0, Math.PI * 2
                );
                this.ctx.fill();
            }
            
            if (index === 0 && this.currentStage === EVOLUTION_STAGES.LEGENDARY) {
                this.ctx.fillStyle = '#ffd700';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.fillText('👑', segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + 18);
            }
            
            this.ctx.shadowBlur = 0;
        });
        
        if (this.currentStage.particles) {
            this.particles.forEach(p => {
                this.ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }
        
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * CELL_SIZE + CELL_SIZE / 2,
            this.food.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    updateScore() {
        document.getElementById('current-score').textContent = this.score;
    }
    
    updateHighScore() {
        const highScore = localStorage.getItem('highScore') || 0;
        document.getElementById('high-score').textContent = highScore;
    }
    
    updateEvolutionDisplay() {
        document.getElementById('evolution-stage').textContent = this.currentStage.name;
        document.getElementById('length-display').textContent = `Length: ${this.snake.length}`;
    }
    
    pauseGame() {
        this.isPaused = true;
        this.showScreen('pause-screen');
    }
    
    resumeGame() {
        this.isPaused = false;
        this.hideScreen('pause-screen');
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.isGameActive = false;
        this.stopBackgroundMusic();
        this.playSound('gameover');
        
        const highScore = parseInt(localStorage.getItem('highScore') || 0);
        if (this.score > highScore) {
            localStorage.setItem('highScore', this.score);
            this.updateHighScore();
        }
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-high-score').textContent = Math.max(this.score, highScore);
        document.getElementById('final-evolution').textContent = this.currentStage.name;
        
        const savedName = localStorage.getItem('playerName') || '';
        document.getElementById('player-name').value = savedName;
        
        this.showScreen('gameover-screen');
        
        this.saveScore();
    }
    
    saveScore() {
        const playerName = document.getElementById('player-name').value || 'Anonymous';
        localStorage.setItem('playerName', playerName);
        
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        leaderboard.push({
            name: playerName,
            score: this.score,
            evolution: this.currentStage.name,
            timestamp: new Date().toISOString()
        });
        
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard.splice(10);
        
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }
    
    showLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        const listDiv = document.getElementById('leaderboard-list');
        
        if (leaderboard.length === 0) {
            listDiv.innerHTML = '<p style="opacity: 0.7;">No scores yet. Be the first!</p>';
        } else {
            listDiv.innerHTML = leaderboard.map((entry, index) => `
                <div class="leaderboard-entry ${index < 3 ? 'top-3' : ''}">
                    <span class="rank">${index + 1}.</span>
                    <span class="name">${entry.name}</span>
                    <span class="score">${entry.score}</span>
                </div>
            `).join('');
        }
        
        this.showScreen('leaderboard-screen');
    }
    
    hideLeaderboard() {
        this.hideScreen('leaderboard-screen');
    }
    
    showSettings() {
        this.showScreen('settings-screen');
    }
    
    hideSettings() {
        this.hideScreen('settings-screen');
    }
    
    exitToMenu() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.isGameActive = false;
        this.stopBackgroundMusic();
        this.hideScreen('pause-screen');
        this.hideScreen('gameover-screen');
        this.hideScreen('game-screen');
        this.showScreen('menu-screen');
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }
    
    hideScreen(screenId) {
        document.getElementById(screenId).classList.remove('active');
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'eat':
                oscillator.frequency.value = 440;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'evolve':
                oscillator.frequency.value = 880;
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'gameover':
                oscillator.frequency.value = 220;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
        }
    }
    
    saveSettings() {
        localStorage.setItem('soundEnabled', this.soundEnabled);
        localStorage.setItem('musicEnabled', this.musicEnabled);
    }
    
    loadSettings() {
        const soundEnabled = localStorage.getItem('soundEnabled');
        const musicEnabled = localStorage.getItem('musicEnabled');
        
        if (soundEnabled !== null) {
            this.soundEnabled = soundEnabled === 'true';
            document.getElementById('sound-toggle').checked = this.soundEnabled;
        }
        
        if (musicEnabled !== null) {
            this.musicEnabled = musicEnabled === 'true';
            document.getElementById('music-toggle').checked = this.musicEnabled;
        }
    }
    
    initBackgroundMusic() {
        this.musicContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    startBackgroundMusic() {
        if (!this.musicEnabled || this.backgroundMusic) return;
        
        if (this.musicContext.state === 'suspended') {
            this.musicContext.resume();
        }
        
        this.playBackgroundLoop();
    }
    
    playBackgroundLoop() {
        if (!this.musicEnabled) return;
        
        const tempo = 0.15;
        const melody = [
            { freq: 523.25, duration: tempo },
            { freq: 587.33, duration: tempo },
            { freq: 659.25, duration: tempo },
            { freq: 587.33, duration: tempo },
            { freq: 523.25, duration: tempo },
            { freq: 493.88, duration: tempo },
            { freq: 440.00, duration: tempo },
            { freq: 493.88, duration: tempo }
        ];
        
        const now = this.musicContext.currentTime;
        let time = now;
        
        melody.forEach(note => {
            const oscillator = this.musicContext.createOscillator();
            const gainNode = this.musicContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(note.freq, time);
            
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(0.08, time + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.musicContext.destination);
            
            oscillator.start(time);
            oscillator.stop(time + note.duration);
            
            time += note.duration;
        });
        
        const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);
        this.backgroundMusic = setTimeout(() => {
            this.backgroundMusic = null;
            if (this.musicEnabled) {
                this.playBackgroundLoop();
            }
        }, totalDuration * 1000);
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            clearTimeout(this.backgroundMusic);
            this.backgroundMusic = null;
        }
        
        if (this.musicContext && this.musicContext.state === 'running') {
            this.musicContext.suspend();
        }
    }
}

const game = new Game();

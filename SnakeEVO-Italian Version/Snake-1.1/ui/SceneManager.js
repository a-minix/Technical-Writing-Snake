import GameEngine from '../core/GameEngine.js';
import HighScoreRepository from '../storage/HighScoreRepository.js';
import EventBus from '../events/EventBus.js';
import Logger from '../utils/Logger.js';

export default class SceneManager {
    constructor() {
        this.currentScene = 'main-menu';
        this.gameEngine = null;
        this.highScoreRepo = new HighScoreRepository();
        
        this.setupScenes();
        this.setupEventListeners();
        this.showScene('main-menu');
    }

    setupScenes() {
        this.scenes = {
            'main-menu': document.getElementById('main-menu'),
            'game-scene': document.getElementById('game-scene'),
            'gameover-scene': document.getElementById('gameover-scene'),
            'leaderboard-scene': document.getElementById('leaderboard-scene')
        };
    }

    setupEventListeners() {
        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('leaderboard-button').addEventListener('click', () => {
            this.showLeaderboard();
        });

        document.getElementById('pause-button').addEventListener('click', () => {
            this.pauseGame();
        });

        document.getElementById('quit-button').addEventListener('click', () => {
            this.quitGame();
        });

        document.getElementById('play-again-button').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('menu-button').addEventListener('click', () => {
            this.showScene('main-menu');
        });

        document.getElementById('back-button').addEventListener('click', () => {
            this.showScene('main-menu');
        });

        document.getElementById('player-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });

        EventBus.on('game-over', (data) => {
            this.showGameOver(data);
        });

        EventBus.on('food-eaten', () => {
            this.updateGameUI();
        });

        EventBus.on('evolution', (data) => {
            this.updateGameUI();
        });
    }

    showScene(sceneName) {
        Object.values(this.scenes).forEach(scene => {
            scene.classList.remove('active');
        });
        
        if (this.scenes[sceneName]) {
            this.scenes[sceneName].classList.add('active');
            this.currentScene = sceneName;
            Logger.info(`Scene: ${sceneName}`);
        }
    }

    startGame() {
        const playerNameInput = document.getElementById('player-name');
        const playerName = playerNameInput.value.trim() || 'Anonymous';
        
        if (!this.gameEngine) {
            const canvas = document.getElementById('game-canvas');
            this.gameEngine = new GameEngine(canvas);
        }
        
        this.showScene('game-scene');
        this.gameEngine.start(playerName);
        this.updateGameUI();
        
        document.getElementById('player-display').textContent = `Player: ${playerName}`;
    }

    pauseGame() {
        if (this.gameEngine) {
            this.gameEngine.pause();
            const pauseButton = document.getElementById('pause-button');
            pauseButton.textContent = this.gameEngine.isPaused ? 'Resume' : 'Pause';
        }
    }

    quitGame() {
        if (this.gameEngine) {
            this.gameEngine.stop();
        }
        this.showScene('main-menu');
    }

    updateGameUI() {
        if (!this.gameEngine) return;
        
        const score = this.gameEngine.getScore();
        const stage = this.gameEngine.getStage();
        
        document.getElementById('score-display').textContent = `Score: ${score}`;
        document.getElementById('stage-display').textContent = `Stage: ${stage.name}`;
    }

    showGameOver(data) {
        document.getElementById('final-score').textContent = `Final Score: ${data.score}`;
        document.getElementById('final-stage').textContent = `Stage Reached: ${data.stage}`;
        
        this.updateLeaderboardData();
        
        this.showScene('gameover-scene');
    }

    updateLeaderboardData() {
        const scores = this.highScoreRepo.getScores();
        const tbody = document.getElementById('leaderboard-body');
        
        tbody.innerHTML = '';
        
        if (scores.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 4;
            cell.textContent = 'No scores yet. Play to set a record!';
            cell.style.textAlign = 'center';
        } else {
            scores.forEach((score, index) => {
                const row = tbody.insertRow();
                
                const rankCell = row.insertCell(0);
                rankCell.textContent = index + 1;
                
                const playerCell = row.insertCell(1);
                playerCell.textContent = score.playerName;
                
                const scoreCell = row.insertCell(2);
                scoreCell.textContent = score.score;
                
                const stageCell = row.insertCell(3);
                stageCell.textContent = score.stage;
            });
        }
    }

    showLeaderboard() {
        this.updateLeaderboardData();
        this.showScene('leaderboard-scene');
    }
}

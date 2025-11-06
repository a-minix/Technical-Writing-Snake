import StorageManager from './StorageManager.js';
import Logger from '../utils/Logger.js';

export default class HighScoreRepository {
    constructor() {
        this.storage = new StorageManager();
        this.maxScores = 10;
    }

    saveScore(playerName, score, stage) {
        const scores = this.getScores();
        
        const newScore = {
            playerName: playerName.trim() || 'Anonymous',
            score: score,
            stage: stage,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };
        
        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);
        
        const topScores = scores.slice(0, this.maxScores);
        
        this.storage.save('highscores', topScores);
        
        const rank = topScores.findIndex(s => s.timestamp === newScore.timestamp) + 1;
        
        Logger.info(`Score saved: ${score} - Rank: ${rank}`);
        
        return {
            rank: rank,
            isTopScore: rank <= this.maxScores
        };
    }

    getScores() {
        const scores = this.storage.load('highscores');
        return scores || [];
    }

    getHighScore() {
        const scores = this.getScores();
        return scores.length > 0 ? scores[0].score : 0;
    }

    clearScores() {
        this.storage.remove('highscores');
        Logger.info('All scores cleared');
    }
}

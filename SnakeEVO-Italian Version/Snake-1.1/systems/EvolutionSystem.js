import { EVOLUTION_STAGES } from '../core/Constants.js';
import EventBus from '../events/EventBus.js';
import Logger from '../utils/Logger.js';

export default class EvolutionSystem {
    constructor() {
        this.currentStage = EVOLUTION_STAGES[0];
    }

    getStageByLength(length) {
        for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
            const stage = EVOLUTION_STAGES[i];
            if (length >= stage.minLength && length <= stage.maxLength) {
                return stage;
            }
        }
        return EVOLUTION_STAGES[0];
    }

    updateStage(snakeLength) {
        const newStage = this.getStageByLength(snakeLength);
        
        if (newStage.name !== this.currentStage.name) {
            const oldStage = this.currentStage;
            this.currentStage = newStage;
            
            Logger.info(`Evolution: ${oldStage.name} -> ${newStage.name}`);
            EventBus.emit('evolution', {
                oldStage,
                newStage,
                length: snakeLength
            });
            
            return true;
        }
        
        return false;
    }

    getCurrentStage() {
        return this.currentStage;
    }

    reset() {
        this.currentStage = EVOLUTION_STAGES[0];
    }
}

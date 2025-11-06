import EventBus from '../events/EventBus.js';
import Logger from '../utils/Logger.js';

export default class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.initialized = true;
            Logger.info('Audio initialized');
        } catch (e) {
            Logger.warn('Web Audio API not supported', e);
            this.enabled = false;
        }
    }

    playSound(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.initialized) return;
        
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.audioContext.currentTime + duration
            );

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            Logger.error('Error playing sound', e);
        }
    }

    playFoodSound() {
        this.playSound(800, 0.1, 'sine');
    }

    playEvolutionSound() {
        this.playSound(1200, 0.3, 'square');
        setTimeout(() => this.playSound(1400, 0.2, 'square'), 100);
    }

    playGameOverSound() {
        this.playSound(200, 0.5, 'sawtooth');
        setTimeout(() => this.playSound(150, 0.5, 'sawtooth'), 200);
    }

    setupEventListeners() {
        EventBus.on('food-eaten', () => this.playFoodSound());
        EventBus.on('evolution', () => this.playEvolutionSound());
        EventBus.on('game-over', () => this.playGameOverSound());
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

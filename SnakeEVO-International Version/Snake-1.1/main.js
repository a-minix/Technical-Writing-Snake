import './style.css';
import SceneManager from './ui/SceneManager.js';
import Logger from './utils/Logger.js';

Logger.info('Snake Evolution v2.0 starting...');

document.addEventListener('DOMContentLoaded', () => {
    const sceneManager = new SceneManager();
    
    window.gameApp = sceneManager;
    
    Logger.info('Snake Evolution v2.0 ready!');
});

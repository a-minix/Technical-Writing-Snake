import Logger from '../utils/Logger.js';

export default class StorageManager {
    constructor() {
        this.storageKey = 'snakeEvolution';
        this.version = '2.0';
    }

    save(key, data) {
        try {
            const record = {
                version: this.version,
                timestamp: Date.now(),
                data: data,
                checksum: this.generateChecksum(data)
            };
            
            localStorage.setItem(`${this.storageKey}_${key}`, JSON.stringify(record));
            return true;
        } catch (e) {
            Logger.error('Failed to save data', e);
            return false;
        }
    }

    load(key) {
        try {
            const item = localStorage.getItem(`${this.storageKey}_${key}`);
            if (!item) return null;
            
            const record = JSON.parse(item);
            
            const expectedChecksum = this.generateChecksum(record.data);
            if (record.checksum !== expectedChecksum) {
                Logger.warn('Checksum mismatch, data may be corrupted');
                return null;
            }
            
            return record.data;
        } catch (e) {
            Logger.error('Failed to load data', e);
            return null;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(`${this.storageKey}_${key}`);
            return true;
        } catch (e) {
            Logger.error('Failed to remove data', e);
            return false;
        }
    }

    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.storageKey)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            Logger.error('Failed to clear data', e);
            return false;
        }
    }

    generateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    export() {
        const data = {};
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storageKey)) {
                data[key] = localStorage.getItem(key);
            }
        });
        return JSON.stringify(data, null, 2);
    }

    import(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            let validCount = 0;
            let invalidCount = 0;
            
            Object.keys(data).forEach(key => {
                if (!key.startsWith(this.storageKey)) {
                    Logger.warn(`Skipping non-project key: ${key}`);
                    return;
                }
                
                try {
                    const record = JSON.parse(data[key]);
                    
                    if (!record.data || !record.checksum) {
                        Logger.warn(`Invalid record format for key: ${key}`);
                        invalidCount++;
                        return;
                    }
                    
                    const expectedChecksum = this.generateChecksum(record.data);
                    if (record.checksum !== expectedChecksum) {
                        Logger.warn(`Checksum mismatch for key: ${key}, skipping`);
                        invalidCount++;
                        return;
                    }
                    
                    localStorage.setItem(key, data[key]);
                    validCount++;
                } catch (err) {
                    Logger.warn(`Failed to validate record for key: ${key}`, err);
                    invalidCount++;
                }
            });
            
            Logger.info(`Import complete: ${validCount} valid, ${invalidCount} invalid records`);
            return validCount > 0;
        } catch (e) {
            Logger.error('Failed to import data', e);
            return false;
        }
    }
}

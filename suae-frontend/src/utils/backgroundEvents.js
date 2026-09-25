// Background event utility for cross-component communication
class BackgroundEventManager {
    constructor() {
        this.listeners = new Set();
    }

    // Subscribe to background change events
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback); // Return unsubscribe function
    }

    // Notify all listeners of background change
    notifyBackgroundChanged(type = 'LOGIN') {
        this.listeners.forEach(callback => {
            try {
                callback(type);
            } catch (error) {
                console.error('Error in background event listener:', error);
            }
        });
    }
}

// Create singleton instance
const backgroundEvents = new BackgroundEventManager();

export default backgroundEvents;
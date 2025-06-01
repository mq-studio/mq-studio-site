/**
 * Background Service Worker for Voice Assistant Extension
 * Handles native messaging and extension coordination
 */

class VoiceAssistantBackground {
    constructor() {
        this.setupMessageHandlers();
        this.setupNativeMessaging();
    }
    
    setupMessageHandlers() {
        // Handle messages from content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleContentScriptMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
        
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });
        
        // Handle native messaging
        chrome.runtime.onConnectExternal.addListener((port) => {
            this.handleExternalConnection(port);
        });
    }
    
    setupNativeMessaging() {
        // Test native messaging host availability on startup
        this.testNativeMessaging();
    }
    
    async handleContentScriptMessage(message, sender, sendResponse) {
        try {
            switch (message.type) {
                case 'transcribe_audio':
                    const result = await this.transcribeAudio(message.audioData, message.audioFormat);
                    sendResponse({ success: true, data: result });
                    break;
                    
                case 'test_native_host':
                    const available = await this.testNativeMessaging();
                    sendResponse({ success: true, available });
                    break;
                    
                case 'get_settings':
                    const settings = await this.getSettings();
                    sendResponse({ success: true, data: settings });
                    break;
                    
                case 'update_settings':
                    await this.updateSettings(message.settings);
                    sendResponse({ success: true });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('[VoiceAssistant Background] Message handling error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    
    async transcribeAudio(audioData, audioFormat) {
        return new Promise((resolve, reject) => {
            const requestId = this.generateRequestId();
            
            // Set up timeout
            const timeout = setTimeout(() => {
                reject(new Error('Native messaging timeout'));
            }, 30000); // 30 second timeout
            
            // Send message to native host
            chrome.runtime.sendNativeMessage(
                'com.voice.assistant',
                {
                    type: 'transcribe',
                    requestId: requestId,
                    audioData: audioData,
                    audioFormat: audioFormat || 'webm'
                },
                (response) => {
                    clearTimeout(timeout);
                    
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response && response.type === 'success') {
                        resolve({
                            transcription: response.data.transcription,
                            confidence: response.data.confidence || 0,
                            processing_time: response.data.processing_time || 0
                        });
                    } else {
                        reject(new Error(response?.error || 'Transcription failed'));
                    }
                }
            );
        });
    }
    
    async testNativeMessaging() {
        try {
            const response = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout'));
                }, 5000);
                
                chrome.runtime.sendNativeMessage(
                    'com.voice.assistant',
                    { type: 'status', requestId: this.generateRequestId() },
                    (response) => {
                        clearTimeout(timeout);
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else {
                            resolve(response);
                        }
                    }
                );
            });
            
            return response && response.type === 'success';
            
        } catch (error) {
            console.warn('[VoiceAssistant Background] Native messaging test failed:', error);
            return false;
        }
    }
    
    async getSettings() {
        const defaultSettings = {
            enabled: true,
            language: 'en-US',
            autoStart: false,
            hotkey: 'Ctrl+Shift+V',
            notificationsEnabled: true,
            fallbackToWebAPI: true
        };
        
        const stored = await chrome.storage.sync.get(['voiceAssistantSettings']);
        return { ...defaultSettings, ...stored.voiceAssistantSettings };
    }
    
    async updateSettings(newSettings) {
        const currentSettings = await this.getSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        
        await chrome.storage.sync.set({
            voiceAssistantSettings: updatedSettings
        });
        
        // Notify all content scripts about settings change
        this.broadcastToContentScripts({
            type: 'settings_updated',
            settings: updatedSettings
        });
    }
    
    async broadcastToContentScripts(message) {
        const tabs = await chrome.tabs.query({});
        
        for (const tab of tabs) {
            try {
                await chrome.tabs.sendMessage(tab.id, message);
            } catch (error) {
                // Ignore errors for tabs without content scripts
            }
        }
    }
    
    handleInstallation(details) {
        if (details.reason === 'install') {
            console.log('[VoiceAssistant Background] Extension installed');
            
            // Open welcome page or setup instructions
            chrome.tabs.create({
                url: chrome.runtime.getURL('popup.html')
            });
            
        } else if (details.reason === 'update') {
            console.log('[VoiceAssistant Background] Extension updated');
        }
    }
    
    handleExternalConnection(port) {
        console.log('[VoiceAssistant Background] External connection:', port);
        
        port.onMessage.addListener((message) => {
            // Handle messages from external applications
            console.log('[VoiceAssistant Background] External message:', message);
        });
        
        port.onDisconnect.addListener(() => {
            console.log('[VoiceAssistant Background] External connection closed');
        });
    }
    
    generateRequestId() {
        return `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Initialize background service
const voiceAssistantBackground = new VoiceAssistantBackground();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceAssistantBackground;
}
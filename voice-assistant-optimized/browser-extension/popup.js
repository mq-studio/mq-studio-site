/**
 * Voice Assistant Extension Popup Script
 */

class VoiceAssistantPopup {
    constructor() {
        this.settings = {};
        this.stats = { transcriptions: 0, successRate: 0 };
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        await this.loadStats();
        this.setupEventListeners();
        await this.checkStatus();
        this.hideLoading();
    }
    
    async loadSettings() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'get_settings'
            });
            
            if (response.success) {
                this.settings = response.data;
                this.updateUI();
            }
        } catch (error) {
            console.error('[Popup] Failed to load settings:', error);
        }
    }
    
    async loadStats() {
        try {
            const stored = await chrome.storage.local.get(['voiceAssistantStats']);
            if (stored.voiceAssistantStats) {
                this.stats = stored.voiceAssistantStats;
                this.updateStatsUI();
            }
        } catch (error) {
            console.error('[Popup] Failed to load stats:', error);
        }
    }
    
    async saveSettings() {
        try {
            await chrome.runtime.sendMessage({
                type: 'update_settings',
                settings: this.settings
            });
        } catch (error) {
            console.error('[Popup] Failed to save settings:', error);
        }
    }
    
    updateUI() {
        // Update toggles
        this.setToggleState('enabled-toggle', this.settings.enabled);
        this.setToggleState('notifications-toggle', this.settings.notificationsEnabled);
        this.setToggleState('fallback-toggle', this.settings.fallbackToWebAPI);
        
        // Update selects
        document.getElementById('language-select').value = this.settings.language || 'en-US';
        
        // Update hotkey display
        document.getElementById('hotkey-display').textContent = this.settings.hotkey || 'Ctrl+Shift+V';
    }
    
    updateStatsUI() {
        document.getElementById('transcriptions-count').textContent = this.stats.transcriptions || 0;
        document.getElementById('success-rate').textContent = 
            this.stats.successRate ? `${Math.round(this.stats.successRate)}%` : '--';
    }
    
    setToggleState(toggleId, active) {
        const toggle = document.getElementById(toggleId);
        if (active) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }
    }
    
    setupEventListeners() {
        // Toggle handlers
        this.setupToggle('enabled-toggle', 'enabled');
        this.setupToggle('notifications-toggle', 'notificationsEnabled');
        this.setupToggle('fallback-toggle', 'fallbackToWebAPI');
        
        // Language select
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.settings.language = e.target.value;
            this.saveSettings();
        });
        
        // Button handlers
        document.getElementById('test-btn').addEventListener('click', () => {
            this.testVoiceInput();
        });
        
        document.getElementById('help-btn').addEventListener('click', () => {
            this.openHelp();
        });
    }
    
    setupToggle(toggleId, settingKey) {
        const toggle = document.getElementById(toggleId);
        toggle.addEventListener('click', () => {
            const newState = !this.settings[settingKey];
            this.settings[settingKey] = newState;
            this.setToggleState(toggleId, newState);
            this.saveSettings();
        });
    }
    
    async checkStatus() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'test_native_host'
            });
            
            const statusElement = document.getElementById('status');
            const statusText = document.getElementById('status-text');
            
            if (response.success && response.available) {
                statusElement.className = 'status connected';
                statusText.textContent = 'Native host connected';
            } else {
                statusElement.className = 'status disconnected';
                statusText.textContent = 'Native host not available - using web fallback';
            }
        } catch (error) {
            const statusElement = document.getElementById('status');
            const statusText = document.getElementById('status-text');
            statusElement.className = 'status disconnected';
            statusText.textContent = 'Extension error';
        }
    }
    
    async testVoiceInput() {
        const testBtn = document.getElementById('test-btn');
        const originalText = testBtn.textContent;
        
        try {
            testBtn.textContent = 'Testing...';
            testBtn.disabled = true;
            
            // Send test message to content script
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
                await chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'test_voice_input'
                });
                
                testBtn.textContent = 'Test Complete';
                setTimeout(() => {
                    testBtn.textContent = originalText;
                    testBtn.disabled = false;
                }, 2000);
            } else {
                throw new Error('No active tab found');
            }
            
        } catch (error) {
            console.error('[Popup] Test failed:', error);
            testBtn.textContent = 'Test Failed';
            setTimeout(() => {
                testBtn.textContent = originalText;
                testBtn.disabled = false;
            }, 2000);
        }
    }
    
    openHelp() {
        chrome.tabs.create({
            url: 'https://github.com/your-repo/voice-assistant#usage'
        });
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new VoiceAssistantPopup();
});
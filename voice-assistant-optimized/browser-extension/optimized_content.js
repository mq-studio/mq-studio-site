/**
 * Optimized Voice Assistant Content Script
 * Implements Gemini's recommendations for better performance and UX
 */

class OptimizedVoiceAssistant {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.currentTextArea = null;
        this.nativeMessagingAvailable = false;
        
        // Performance optimizations
        this.buttonCache = new Map();
        this.observerConfig = {
            childList: true,
            subtree: true,
            attributeFilter: ['contenteditable', 'role', 'class']
        };
        
        // Platform detection
        this.platform = this.detectPlatform();
        this.selectors = this.getPlatformSelectors();
        
        // UI state management
        this.processingStates = new Map();
        
        this.init();
    }
    
    detectPlatform() {
        const hostname = window.location.hostname;
        
        if (hostname.includes('claude.ai')) return 'claude';
        if (hostname.includes('gemini.google.com')) return 'gemini';
        if (hostname.includes('perplexity.ai')) return 'perplexity';
        if (hostname.includes('chatgpt.com')) return 'chatgpt';
        
        return 'generic';
    }
    
    getPlatformSelectors() {
        const selectors = {
            claude: {
                textArea: '[contenteditable="true"]',
                container: '.composer, .chat-input',
                insertLocation: '.composer-controls'
            },
            gemini: {
                textArea: '[contenteditable="true"]',
                container: '.chat-input-container',
                insertLocation: '.input-area-controls'
            },
            perplexity: {
                textArea: 'textarea[placeholder*="Ask"], [contenteditable="true"]',
                container: '.search-input, .chat-input',
                insertLocation: '.input-controls'
            },
            chatgpt: {
                textArea: '#prompt-textarea, [contenteditable="true"]',
                container: '.composer-parent',
                insertLocation: '.composer-controls'
            },
            generic: {
                textArea: 'textarea, [contenteditable="true"]',
                container: 'form, .input-container',
                insertLocation: null
            }
        };
        
        return selectors[this.platform] || selectors.generic;
    }
    
    async init() {
        console.log(`[VoiceAssistant] Initializing for ${this.platform} platform`);
        
        // Test native messaging availability
        await this.testNativeMessaging();
        
        // Inject voice buttons
        this.injectVoiceButtons();
        
        // Setup optimized mutation observer
        this.setupMutationObserver();
        
        // Setup global keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        console.log(`[VoiceAssistant] Initialized (Native messaging: ${this.nativeMessagingAvailable})`);
    }
    
    async testNativeMessaging() {
        try {
            const response = await this.sendNativeMessage({
                type: 'status',
                requestId: this.generateRequestId()
            });
            
            this.nativeMessagingAvailable = response && response.type === 'success';
            console.log('[VoiceAssistant] Native messaging test:', this.nativeMessagingAvailable);
            
        } catch (error) {
            console.warn('[VoiceAssistant] Native messaging not available:', error);
            this.nativeMessagingAvailable = false;
        }
    }
    
    setupMutationObserver() {
        // Optimized observer that only watches relevant changes
        const observer = new MutationObserver((mutations) => {
            let shouldReinject = false;
            
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches && node.matches(this.selectors.textArea)) {
                                shouldReinject = true;
                                break;
                            }
                            if (node.querySelector && node.querySelector(this.selectors.textArea)) {
                                shouldReinject = true;
                                break;
                            }
                        }
                    }
                }
                
                if (shouldReinject) break;
            }
            
            if (shouldReinject) {
                // Debounce reinjection
                clearTimeout(this.reinjectTimeout);
                this.reinjectTimeout = setTimeout(() => {
                    this.injectVoiceButtons();
                }, 100);
            }
        });
        
        observer.observe(document.body, this.observerConfig);
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            observer.disconnect();
        });
    }
    
    injectVoiceButtons() {
        const textAreas = document.querySelectorAll(this.selectors.textArea);
        
        textAreas.forEach(textArea => {
            if (textArea.dataset.voiceEnabled) return;
            
            const voiceButton = this.createVoiceButton();
            this.insertVoiceButton(textArea, voiceButton);
            textArea.dataset.voiceEnabled = 'true';
            
            // Cache for performance
            this.buttonCache.set(textArea, voiceButton);
        });
    }
    
    createVoiceButton() {
        const button = document.createElement('button');
        button.className = 'voice-assistant-btn';
        button.innerHTML = '🎤';
        button.title = 'Voice input (Ctrl+Shift+V)';
        button.type = 'button';
        button.setAttribute('aria-label', 'Start voice input');
        
        // Enhanced click handler
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent double-clicks during processing
            if (this.processingStates.get(button)) return;
            
            await this.toggleRecording(button);
        });
        
        return button;
    }
    
    insertVoiceButton(textArea, button) {
        try {
            if (this.selectors.insertLocation) {
                const container = textArea.closest(this.selectors.container);
                const insertTarget = container?.querySelector(this.selectors.insertLocation);
                
                if (insertTarget) {
                    insertTarget.appendChild(button);
                    return;
                }
            }
            
            // Fallback positioning
            this.insertButtonFallback(textArea, button);
            
        } catch (error) {
            console.warn('[VoiceAssistant] Button insertion failed:', error);
            this.insertButtonFallback(textArea, button);
        }
    }
    
    insertButtonFallback(textArea, button) {
        // Generic positioning for any text area
        const wrapper = textArea.parentElement;
        
        if (wrapper) {
            button.style.position = 'absolute';
            button.style.right = '5px';
            button.style.top = '5px';
            button.style.zIndex = '9999';
            
            if (getComputedStyle(wrapper).position === 'static') {
                wrapper.style.position = 'relative';
            }
            
            wrapper.appendChild(button);
        }
    }
    
    async toggleRecording(button) {
        if (this.isRecording) {
            await this.stopRecording(button);
        } else {
            await this.startRecording(button);
        }
    }
    
    async startRecording(button) {
        try {
            // Update UI immediately
            this.updateButtonState(button, 'requesting');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: this.getBestMimeType()
            });
            
            this.audioChunks = [];
            this.currentTextArea = this.findNearestTextArea(button);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                await this.processAudio(button);
            };
            
            this.mediaRecorder.onerror = (event) => {
                console.error('[VoiceAssistant] MediaRecorder error:', event);
                this.updateButtonState(button, 'error');
                this.showNotification('Recording error occurred', 'error');
            };
            
            this.mediaRecorder.start(100); // 100ms chunks for better responsiveness
            this.isRecording = true;
            
            this.updateButtonState(button, 'recording');
            this.showNotification('Recording started...', 'info');
            
        } catch (error) {
            console.error('[VoiceAssistant] Recording start failed:', error);
            this.updateButtonState(button, 'error');
            
            if (error.name === 'NotAllowedError') {
                this.showNotification('Microphone permission denied', 'error');
            } else {
                this.showNotification('Could not start recording', 'error');
            }
        }
    }
    
    async stopRecording(button) {
        if (this.mediaRecorder && this.isRecording) {
            this.isRecording = false;
            this.updateButtonState(button, 'stopping');
            this.mediaRecorder.stop();
        }
    }
    
    getBestMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/ogg;codecs=opus'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        
        return undefined; // Use default
    }
    
    async processAudio(button) {
        if (this.audioChunks.length === 0) {
            this.updateButtonState(button, 'idle');
            this.showNotification('No audio recorded', 'warning');
            return;
        }
        
        try {
            this.updateButtonState(button, 'processing');
            this.processingStates.set(button, true);
            
            const audioBlob = new Blob(this.audioChunks, { 
                type: this.mediaRecorder.mimeType || 'audio/webm'
            });
            
            let text;
            
            if (this.nativeMessagingAvailable) {
                text = await this.transcribeWithNativeHost(audioBlob);
            } else {
                text = await this.transcribeWithWebAPI(audioBlob);
            }
            
            if (text && text.trim()) {
                await this.insertText(text);
                this.showNotification(`Transcribed: "${text.substring(0, 30)}..."`, 'success');
            } else {
                this.showNotification('No speech detected', 'warning');
            }
            
        } catch (error) {
            console.error('[VoiceAssistant] Transcription failed:', error);
            this.showNotification('Transcription failed', 'error');
        } finally {
            this.updateButtonState(button, 'idle');
            this.processingStates.delete(button);
        }
    }
    
    async transcribeWithNativeHost(audioBlob) {
        const audioData = await this.blobToBase64(audioBlob);
        const audioFormat = this.getFormatFromMimeType(audioBlob.type);
        
        const response = await this.sendNativeMessage({
            type: 'transcribe',
            requestId: this.generateRequestId(),
            audioData: audioData,
            audioFormat: audioFormat
        });
        
        if (response.type === 'success') {
            return response.data.transcription;
        } else {
            throw new Error(response.error || 'Transcription failed');
        }
    }
    
    async transcribeWithWebAPI(audioBlob) {
        // Fallback to Web Speech API
        return new Promise((resolve, reject) => {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            
            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                resolve(transcript);
            };
            
            recognition.onerror = (event) => {
                reject(new Error(`Speech recognition error: ${event.error}`));
            };
            
            recognition.onnomatch = () => {
                resolve('');
            };
            
            // Convert blob to audio for Web Speech API
            const audio = new Audio(URL.createObjectURL(audioBlob));
            recognition.start();
        });
    }
    
    async sendNativeMessage(message) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Native messaging timeout'));
            }, 10000);
            
            chrome.runtime.sendNativeMessage(
                'com.voiceassistant.host',
                message,
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
    }
    
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    
    getFormatFromMimeType(mimeType) {
        if (mimeType.includes('webm')) return 'webm';
        if (mimeType.includes('mp4')) return 'mp4';
        if (mimeType.includes('ogg')) return 'ogg';
        return 'webm'; // Default
    }
    
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    findNearestTextArea(button) {
        const container = button.closest(this.selectors.container) || button.parentElement;
        return container?.querySelector(this.selectors.textArea);
    }
    
    async insertText(text) {
        if (!this.currentTextArea || !text) return;
        
        try {
            // Focus the text area first
            this.currentTextArea.focus();
            
            if (this.currentTextArea.contentEditable === 'true') {
                await this.insertIntoContentEditable(text);
            } else {
                await this.insertIntoTextArea(text);
            }
            
            // Trigger change events
            this.triggerInputEvents();
            
        } catch (error) {
            console.error('[VoiceAssistant] Text insertion failed:', error);
            // Fallback: copy to clipboard
            await this.copyToClipboard(text);
            this.showNotification('Text copied to clipboard', 'info');
        }
    }
    
    async insertIntoContentEditable(text) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Create text node
        const textNode = document.createTextNode(text);
        
        // Insert text
        range.deleteContents();
        range.insertNode(textNode);
        
        // Move cursor to end
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    async insertIntoTextArea(text) {
        const startPos = this.currentTextArea.selectionStart || 0;
        const endPos = this.currentTextArea.selectionEnd || 0;
        const currentValue = this.currentTextArea.value || '';
        
        // Insert text at cursor position
        this.currentTextArea.value = 
            currentValue.substring(0, startPos) + 
            text + 
            currentValue.substring(endPos);
        
        // Set cursor position
        const newCursorPos = startPos + text.length;
        this.currentTextArea.selectionStart = newCursorPos;
        this.currentTextArea.selectionEnd = newCursorPos;
    }
    
    triggerInputEvents() {
        // Trigger various events that applications might listen for
        const events = ['input', 'change', 'keyup'];
        
        events.forEach(eventType => {
            const event = new Event(eventType, { bubbles: true });
            this.currentTextArea.dispatchEvent(event);
        });
    }
    
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
    
    updateButtonState(button, state) {
        // Remove all state classes
        button.classList.remove('recording', 'processing', 'error', 'requesting', 'stopping');
        
        switch (state) {
            case 'requesting':
                button.innerHTML = '⏳';
                button.title = 'Requesting microphone access...';
                button.classList.add('requesting');
                break;
                
            case 'recording':
                button.innerHTML = '⏹️';
                button.title = 'Click to stop recording';
                button.classList.add('recording');
                break;
                
            case 'stopping':
                button.innerHTML = '⏸️';
                button.title = 'Stopping recording...';
                button.classList.add('stopping');
                break;
                
            case 'processing':
                button.innerHTML = '🔄';
                button.title = 'Processing audio...';
                button.classList.add('processing');
                break;
                
            case 'error':
                button.innerHTML = '❌';
                button.title = 'Error occurred - click to retry';
                button.classList.add('error');
                setTimeout(() => this.updateButtonState(button, 'idle'), 3000);
                break;
                
            case 'idle':
            default:
                button.innerHTML = '🎤';
                button.title = 'Voice input (Ctrl+Shift+V)';
                break;
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `voice-assistant-notification ${type}`;
        notification.textContent = message;
        
        // Position and style
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 15px',
            borderRadius: '5px',
            zIndex: '10000',
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
        });
        
        // Type-specific styling
        const colors = {
            info: { bg: '#3498db', color: '#fff' },
            success: { bg: '#2ecc71', color: '#fff' },
            warning: { bg: '#f39c12', color: '#fff' },
            error: { bg: '#e74c3c', color: '#fff' }
        };
        
        const colorScheme = colors[type] || colors.info;
        notification.style.backgroundColor = colorScheme.bg;
        notification.style.color = colorScheme.color;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+V for voice input
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                
                // Find the focused text area or the first available one
                let targetButton = null;
                
                if (document.activeElement && this.buttonCache.has(document.activeElement)) {
                    targetButton = this.buttonCache.get(document.activeElement);
                } else {
                    // Find first available button
                    targetButton = document.querySelector('.voice-assistant-btn');
                }
                
                if (targetButton) {
                    this.toggleRecording(targetButton);
                }
            }
        });
    }
}

// Initialize when page loads
function initializeVoiceAssistant() {
    if (window.voiceAssistantInstance) {
        return; // Already initialized
    }
    
    window.voiceAssistantInstance = new OptimizedVoiceAssistant();
}

// Initialize based on page state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVoiceAssistant);
} else {
    initializeVoiceAssistant();
}

// Re-initialize on navigation for SPAs
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(initializeVoiceAssistant, 1000); // Delay for SPA navigation
    }
}).observe(document, { subtree: true, childList: true });
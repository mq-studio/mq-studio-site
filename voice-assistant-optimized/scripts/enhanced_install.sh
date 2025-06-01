#!/bin/bash

# Enhanced Voice Assistant Installation Script
# Implements Gemini's recommendations for better validation and error handling

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handler
error_handler() {
    local line_number=$1
    log_error "Installation failed at line $line_number"
    log_error "Check the logs above for details"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Configuration
PROJECT_NAME="voice-assistant-optimized"
PROJECT_DIR="$HOME/code/$PROJECT_NAME"
PYTHON_MIN_VERSION="3.8"
VENV_NAME="venv"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to compare version numbers
version_ge() {
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

# Function to check Python version
check_python_version() {
    if ! command_exists python3; then
        log_error "Python 3 is required but not installed"
        log_info "Install Python 3 with: sudo apt update && sudo apt install python3 python3-pip python3-venv"
        return 1
    fi
    
    local python_version
    python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    
    if ! version_ge "$python_version" "$PYTHON_MIN_VERSION"; then
        log_error "Python $PYTHON_MIN_VERSION or higher is required (found $python_version)"
        return 1
    fi
    
    log_success "Python $python_version found"
    return 0
}

# Function to check system dependencies
check_system_dependencies() {
    local missing_deps=()
    
    # Essential dependencies
    local deps=(
        "python3-pip"
        "python3-venv" 
        "python3-dev"
        "portaudio19-dev"
        "ffmpeg"
        "git"
    )
    
    log_info "Checking system dependencies..."
    
    for dep in "${deps[@]}"; do
        if ! dpkg -l | grep -q "^ii  $dep "; then
            missing_deps+=("$dep")
        fi
    done
    
    # Optional but recommended dependencies
    local optional_deps=(
        "xclip"           # For clipboard functionality
        "notify-send"     # For notifications (usually in libnotify-bin)
        "xdotool"         # For window detection
    )
    
    for dep in "${optional_deps[@]}"; do
        if ! command_exists "$dep"; then
            log_warning "Optional dependency '$dep' not found"
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_info "Install with: sudo apt update && sudo apt install ${missing_deps[*]}"
        return 1
    fi
    
    log_success "All required system dependencies found"
    return 0
}

# Function to check audio system
check_audio_system() {
    log_info "Checking audio system..."
    
    # Check if PulseAudio is running
    if ! pgrep -x pulseaudio >/dev/null; then
        log_warning "PulseAudio not running - audio may not work properly"
    fi
    
    # Check for audio devices
    if command_exists pactl; then
        local input_devices
        input_devices=$(pactl list sources short | grep -c input || true)
        
        if [ "$input_devices" -eq 0 ]; then
            log_warning "No audio input devices found"
        else
            log_success "Audio input devices found: $input_devices"
        fi
    fi
    
    # Test basic audio functionality
    if command_exists aplay && [ -f /usr/share/sounds/alsa/Front_Left.wav ]; then
        log_info "Testing audio playback..."
        if timeout 3s aplay /usr/share/sounds/alsa/Front_Left.wav >/dev/null 2>&1; then
            log_success "Audio playback test passed"
        else
            log_warning "Audio playback test failed"
        fi
    fi
}

# Function to check available memory
check_memory() {
    log_info "Checking available memory..."
    
    local total_mem
    local available_mem
    
    total_mem=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    available_mem=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
    
    # Convert to GB
    total_gb=$((total_mem / 1024 / 1024))
    available_gb=$((available_mem / 1024 / 1024))
    
    log_info "Total memory: ${total_gb}GB, Available: ${available_gb}GB"
    
    if [ "$available_gb" -lt 2 ]; then
        log_warning "Low available memory (${available_gb}GB). Consider closing other applications."
        log_warning "Recommend using 'tiny' Whisper model for better performance."
    elif [ "$available_gb" -lt 4 ]; then
        log_info "Moderate memory available. 'base' model recommended."
    else
        log_success "Sufficient memory for any Whisper model."
    fi
}

# Function to create project directory with proper permissions
setup_project_directory() {
    log_info "Setting up project directory: $PROJECT_DIR"
    
    # Create directory structure
    mkdir -p "$PROJECT_DIR"/{src,models,config,logs,scripts,browser-extension,native-messaging,tests}
    
    # Set proper permissions
    chmod 755 "$PROJECT_DIR"
    chmod 755 "$PROJECT_DIR"/{src,models,config,logs,scripts,browser-extension,native-messaging,tests}
    
    # Create logs directory with write permissions
    chmod 766 "$PROJECT_DIR/logs"
    
    log_success "Project directory structure created"
}

# Function to setup Python virtual environment
setup_python_environment() {
    log_info "Setting up Python virtual environment..."
    
    cd "$PROJECT_DIR"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "$VENV_NAME" ]; then
        python3 -m venv "$VENV_NAME"
        log_success "Virtual environment created"
    else
        log_info "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    # shellcheck source=/dev/null
    source "$VENV_NAME/bin/activate"
    
    # Upgrade pip to latest version
    pip install --upgrade pip
    
    # Install wheel for better package compilation
    pip install wheel
    
    log_success "Python environment ready"
}

# Function to install Python dependencies with error handling
install_python_dependencies() {
    log_info "Installing Python dependencies..."
    
    cd "$PROJECT_DIR"
    # shellcheck source=/dev/null
    source "$VENV_NAME/bin/activate"
    
    # Check if requirements.txt exists
    if [ ! -f "requirements.txt" ]; then
        log_error "requirements.txt not found in project directory"
        return 1
    fi
    
    # Install dependencies with verbose output and timeout
    if timeout 300s pip install -r requirements.txt --verbose; then
        log_success "Python dependencies installed successfully"
    else
        log_error "Failed to install Python dependencies within timeout"
        log_info "Try running manually: pip install -r requirements.txt"
        return 1
    fi
    
    # Verify critical imports
    log_info "Verifying critical imports..."
    
    local critical_modules=("whisper" "pyaudio" "numpy" "aiohttp")
    
    for module in "${critical_modules[@]}"; do
        if python -c "import $module" 2>/dev/null; then
            log_success "$module import successful"
        else
            log_error "$module import failed"
            return 1
        fi
    done
}

# Function to download and cache Whisper models
setup_whisper_models() {
    log_info "Setting up Whisper models..."
    
    cd "$PROJECT_DIR"
    # shellcheck source=/dev/null
    source "$VENV_NAME/bin/activate"
    
    # Create models cache directory
    local cache_dir="$PROJECT_DIR/models"
    export XDG_CACHE_HOME="$cache_dir"
    
    # Download models based on available memory
    local available_mem
    available_mem=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
    local available_gb=$((available_mem / 1024 / 1024))
    
    local models_to_download=("tiny")
    
    if [ "$available_gb" -ge 3 ]; then
        models_to_download+=("base")
    fi
    
    if [ "$available_gb" -ge 6 ]; then
        models_to_download+=("small")
    fi
    
    for model in "${models_to_download[@]}"; do
        log_info "Downloading Whisper '$model' model..."
        
        if timeout 600s python -c "
import whisper
import os
os.environ['XDG_CACHE_HOME'] = '$cache_dir'
print(f'Downloading {model} model...')
whisper.load_model('$model')
print(f'{model} model downloaded successfully')
        "; then
            log_success "Whisper '$model' model ready"
        else
            log_warning "Failed to download Whisper '$model' model"
        fi
    done
}

# Function to create configuration files
setup_configuration() {
    log_info "Creating configuration files..."
    
    # Create main config file
    cat > "$PROJECT_DIR/config/config.json" << 'EOF'
{
  "whisper_model": "base",
  "sample_rate": 16000,
  "chunk_size": 1024,
  "hotkey": "ctrl+shift+v",
  "cloud_fallback": false,
  "cloud_provider": "google",
  "max_recording_duration": 30,
  "min_recording_duration": 1,
  "audio_enhancement": {
    "noise_reduction": true,
    "normalize_volume": true,
    "auto_gain": true,
    "vad_enabled": false
  },
  "output_options": {
    "auto_type": true,
    "copy_to_clipboard": true,
    "show_notification": true
  },
  "performance": {
    "in_memory_processing": true,
    "concurrent_processing": true,
    "cache_models": true
  },
  "security": {
    "use_env_vars_for_keys": true,
    "log_transcriptions": true,
    "encrypt_logs": false
  }
}
EOF
    
    # Create environment template
    cat > "$PROJECT_DIR/.env.example" << 'EOF'
# Cloud Provider API Keys
GOOGLE_SPEECH_API_KEY=your_google_api_key_here
AZURE_SPEECH_KEY=your_azure_subscription_key_here
AZURE_SPEECH_REGION=eastus
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here

# Optional: Custom model cache directory
# XDG_CACHE_HOME=/path/to/custom/cache
EOF
    
    log_success "Configuration files created"
}

# Function to setup browser extension
setup_browser_extension() {
    log_info "Setting up browser extension..."
    
    # Make native messaging host executable
    chmod +x "$PROJECT_DIR/native-messaging/voice_assistant_host.py"
    
    # Update native messaging host manifest with correct path
    local manifest_file="$PROJECT_DIR/native-messaging/voice_assistant_host.json"
    
    # Create updated manifest
    cat > "$manifest_file" << EOF
{
  "name": "com.voiceassistant.host",
  "description": "Voice Assistant Native Messaging Host",
  "path": "$PROJECT_DIR/native-messaging/voice_assistant_host.py",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://EXTENSION_ID_PLACEHOLDER/"
  ]
}
EOF
    
    log_success "Browser extension setup complete"
    log_info "Note: You'll need to install the Chrome extension manually"
}

# Function to create startup scripts
create_startup_scripts() {
    log_info "Creating startup scripts..."
    
    # Main startup script
    cat > "$PROJECT_DIR/scripts/start_voice_assistant.sh" << EOF
#!/bin/bash
cd "$PROJECT_DIR"
source $VENV_NAME/bin/activate
python src/optimized_voice_service.py
EOF
    
    # Native messaging host installer
    cat > "$PROJECT_DIR/scripts/install_native_messaging.sh" << 'EOF'
#!/bin/bash
# Install native messaging host for Chrome/Chromium

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST_FILE="$PROJECT_DIR/native-messaging/voice_assistant_host.json"

# Chrome native messaging directory
CHROME_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
CHROMIUM_DIR="$HOME/.config/chromium/NativeMessagingHosts"

echo "Installing native messaging host..."

# Create directories if they don't exist
mkdir -p "$CHROME_DIR" "$CHROMIUM_DIR"

# Copy manifest to both Chrome and Chromium
cp "$MANIFEST_FILE" "$CHROME_DIR/"
cp "$MANIFEST_FILE" "$CHROMIUM_DIR/"

echo "Native messaging host installed successfully"
echo "Note: You still need to install the browser extension"
EOF
    
    # Make scripts executable
    chmod +x "$PROJECT_DIR/scripts/start_voice_assistant.sh"
    chmod +x "$PROJECT_DIR/scripts/install_native_messaging.sh"
    
    log_success "Startup scripts created"
}

# Function to create desktop entry
create_desktop_entry() {
    log_info "Creating desktop entry..."
    
    local desktop_file="$HOME/.local/share/applications/voice-assistant.desktop"
    
    cat > "$desktop_file" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Voice Assistant
Comment=Voice-to-text for AI development
Exec=$PROJECT_DIR/scripts/start_voice_assistant.sh
Icon=microphone
Terminal=true
Categories=Development;Utility;AudioVideo;
StartupNotify=true
EOF
    
    chmod +x "$desktop_file"
    
    log_success "Desktop entry created"
}

# Function to run basic tests
run_basic_tests() {
    log_info "Running basic tests..."
    
    cd "$PROJECT_DIR"
    # shellcheck source=/dev/null
    source "$VENV_NAME/bin/activate"
    
    # Test imports
    if python -c "
from src.optimized_voice_service import OptimizedVoiceAssistant
from src.enhanced_cloud_providers import CloudProviderFactory
print('✓ Core imports successful')
    "; then
        log_success "Core module imports successful"
    else
        log_error "Core module import test failed"
        return 1
    fi
    
    # Test configuration loading
    if python -c "
from src.optimized_voice_service import OptimizedVoiceAssistant
assistant = OptimizedVoiceAssistant('config/config.json')
print('✓ Configuration loading successful')
    "; then
        log_success "Configuration loading test passed"
    else
        log_error "Configuration loading test failed"
        return 1
    fi
    
    log_success "Basic tests completed"
}

# Function to print installation summary
print_summary() {
    log_success "Voice Assistant installation completed successfully!"
    echo
    echo "📋 Installation Summary:"
    echo "   Project directory: $PROJECT_DIR"
    echo "   Python environment: $PROJECT_DIR/$VENV_NAME"
    echo "   Configuration: $PROJECT_DIR/config/config.json"
    echo "   Logs: $PROJECT_DIR/logs/"
    echo
    echo "🚀 Next Steps:"
    echo "   1. Start the voice assistant:"
    echo "      $PROJECT_DIR/scripts/start_voice_assistant.sh"
    echo
    echo "   2. Install browser extension:"
    echo "      - Open Chrome and go to chrome://extensions/"
    echo "      - Enable 'Developer mode'"
    echo "      - Click 'Load unpacked'"
    echo "      - Select: $PROJECT_DIR/browser-extension/"
    echo
    echo "   3. Install native messaging (for browser integration):"
    echo "      $PROJECT_DIR/scripts/install_native_messaging.sh"
    echo
    echo "   4. Configure cloud providers (optional):"
    echo "      - Copy $PROJECT_DIR/.env.example to $PROJECT_DIR/.env"
    echo "      - Add your API keys"
    echo
    echo "🎯 Usage:"
    echo "   - Press Ctrl+Shift+V to start/stop voice recording"
    echo "   - Speak clearly and text will be typed automatically"
    echo "   - Check $PROJECT_DIR/logs/ for transcription history"
    echo
    echo "📚 Documentation:"
    echo "   - Original report: /home/ichardart/code/voice-to-text-implementation-report.md"
    echo "   - Config file: $PROJECT_DIR/config/config.json"
    echo
    echo "🐛 Troubleshooting:"
    echo "   - Check logs in: $PROJECT_DIR/logs/"
    echo "   - Test audio: aplay /usr/share/sounds/alsa/Front_Left.wav"
    echo "   - Verify microphone: arecord -d 3 -f cd test.wav && aplay test.wav"
}

# Main installation function
main() {
    echo "🎤 Enhanced Voice Assistant Installation"
    echo "======================================"
    echo
    
    log_info "Starting installation checks..."
    
    # System checks
    check_python_version
    check_system_dependencies
    check_audio_system
    check_memory
    
    # Setup
    setup_project_directory
    setup_python_environment
    install_python_dependencies
    setup_whisper_models
    setup_configuration
    setup_browser_extension
    create_startup_scripts
    create_desktop_entry
    
    # Testing
    run_basic_tests
    
    # Summary
    print_summary
    
    log_success "Installation completed successfully! 🎉"
}

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
    log_warning "Running as root is not recommended"
    log_info "Consider running as a regular user"
fi

# Check if script is being sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
else
    log_info "Script sourced. Run 'main' to start installation."
fi
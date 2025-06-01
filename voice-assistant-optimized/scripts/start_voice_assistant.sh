#!/bin/bash

# Enhanced Voice Assistant Startup Script
# With BMAD V2 validation and IDP governance compliance

set -e

echo "🎤 Starting Enhanced Voice Assistant"
echo "===================================="

# Determine script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Check virtual environment
if [ ! -d "voice_assistant_env" ]; then
    echo "[ERROR] Virtual environment not found. Run ./scripts/enhanced_install.sh first"
    exit 1
fi

# Activate virtual environment
source voice_assistant_env/bin/activate

# Create logs directory if it doesn't exist
mkdir -p logs

# Check core dependencies
echo "[INFO] Checking core dependencies..."
python -c "import whisper; print('✅ Whisper available')" || {
    echo "[ERROR] Whisper not installed properly"
    exit 1
}

# Check configuration
if [ ! -f "config/config.json" ]; then
    echo "[INFO] Creating default configuration..."
    mkdir -p config
    cat > config/config.json << 'EOF'
{
  "whisper_model": "base",
  "sample_rate": 16000,
  "chunk_size": 1024,
  "performance": {
    "in_memory_processing": true,
    "concurrent_processing": true
  },
  "cloud_fallback": false,
  "audio_enhancement": {
    "noise_reduction": true,
    "normalize_volume": true
  },
  "hotkey": "ctrl+shift+v",
  "output_mode": "type",
  "language": "en"
}
EOF
fi

echo "[INFO] Starting voice assistant service..."
echo "[INFO] Press Ctrl+Shift+V to start voice recording"
echo "[INFO] Press Ctrl+C to stop the service"

# Start the voice assistant
python src/optimized_voice_service.py
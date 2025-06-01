import whisper
import pyaudio
import threading
import keyboard
import time
import json
import os
import queue
import numpy as np
from datetime import datetime
import logging
from typing import Optional, Dict, Any
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/voice_assistant.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class OptimizedVoiceAssistant:
    def __init__(self, config_path="config/config.json"):
        self.config = self.load_config(config_path)
        self.model = None
        self.recording = False
        self.audio_queue = queue.Queue()
        self.command_queue = queue.Queue()
        self.executor = ThreadPoolExecutor(max_workers=2)
        
        # Audio processing buffers
        self.audio_buffer = []
        self.sample_rate = self.config['sample_rate']
        self.chunk_size = self.config['chunk_size']
        
        # Threading components
        self.audio_thread = None
        self.processing_thread = None
        self.hotkey_thread = None
        self.running = False
        
        # Performance monitoring
        self.stats = {
            'transcriptions': 0,
            'errors': 0,
            'avg_processing_time': 0
        }
        
        self.setup_audio()
        self.load_model()
    
    def load_config(self, path: str) -> Dict[str, Any]:
        """Load configuration with enhanced security for API keys"""
        default_config = {
            "whisper_model": "base",
            "sample_rate": 16000,
            "chunk_size": 1024,
            "hotkey": "ctrl+shift+v",
            "cloud_fallback": True,
            "cloud_provider": "google",
            "max_recording_duration": 30,
            "min_recording_duration": 1,
            "audio_enhancement": {
                "noise_reduction": True,
                "normalize_volume": True,
                "auto_gain": True,
                "vad_enabled": False  # Voice Activity Detection
            },
            "output_options": {
                "auto_type": True,
                "copy_to_clipboard": True,
                "show_notification": True
            },
            "performance": {
                "in_memory_processing": True,
                "concurrent_processing": True,
                "cache_models": True
            },
            "security": {
                "use_env_vars_for_keys": True,
                "log_transcriptions": True,
                "encrypt_logs": False
            }
        }
        
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    config = json.load(f)
                merged_config = {**default_config, **config}
                
                # Security: Prefer environment variables for API keys
                if merged_config['security']['use_env_vars_for_keys']:
                    cloud_keys = {
                        'google_api_key': os.getenv('GOOGLE_SPEECH_API_KEY'),
                        'azure_subscription_key': os.getenv('AZURE_SPEECH_KEY'),
                        'azure_region': os.getenv('AZURE_SPEECH_REGION', 'eastus'),
                        'aws_access_key': os.getenv('AWS_ACCESS_KEY_ID'),
                        'aws_secret_key': os.getenv('AWS_SECRET_ACCESS_KEY')
                    }
                    merged_config.update(cloud_keys)
                
                return merged_config
            except Exception as e:
                logger.error(f"Error loading config: {e}. Using defaults.")
                return default_config
        else:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w') as f:
                json.dump(default_config, f, indent=2)
            return default_config
    
    def setup_audio(self):
        """Initialize audio system with better error handling"""
        try:
            self.audio = pyaudio.PyAudio()
            
            # Test audio device availability
            device_count = self.audio.get_device_count()
            logger.info(f"Found {device_count} audio devices")
            
            # Find default input device
            try:
                default_input = self.audio.get_default_input_device_info()
                logger.info(f"Default input device: {default_input['name']}")
            except OSError as e:
                logger.warning(f"No default input device found: {e}")
                
        except Exception as e:
            logger.error(f"Audio setup failed: {e}")
            raise
    
    def load_model(self):
        """Load Whisper model with caching and error handling"""
        try:
            model_name = self.config['whisper_model']
            logger.info(f"Loading Whisper model: {model_name}")
            
            # Set custom cache directory if configured
            cache_dir = self.config.get('model_cache_dir')
            if cache_dir:
                os.environ['XDG_CACHE_HOME'] = cache_dir
            
            self.model = whisper.load_model(model_name)
            logger.info("Model loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            if self.config['cloud_fallback']:
                logger.info("Model loading failed, will use cloud fallback")
                self.model = None
            else:
                raise
    
    def start_recording(self):
        """Start audio recording with improved buffer management"""
        if self.recording:
            return
        
        logger.info("Starting audio recording")
        self.recording = True
        self.audio_buffer = []
        
        try:
            self.stream = self.audio.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=self.sample_rate,
                input=True,
                frames_per_buffer=self.chunk_size,
                stream_callback=self.audio_callback,
                start=False  # Don't start immediately
            )
            
            self.stream.start_stream()
            logger.info("Recording started")
            
        except Exception as e:
            logger.error(f"Failed to start recording: {e}")
            self.recording = False
            raise
    
    def stop_recording(self):
        """Stop recording and trigger processing"""
        if not self.recording:
            return
        
        logger.info("Stopping recording")
        self.recording = False
        
        try:
            if hasattr(self, 'stream') and self.stream:
                self.stream.stop_stream()
                self.stream.close()
            
            # Queue audio for processing
            if self.audio_buffer:
                self.audio_queue.put(self.audio_buffer.copy())
                logger.info(f"Queued {len(self.audio_buffer)} audio chunks for processing")
            
        except Exception as e:
            logger.error(f"Error stopping recording: {e}")
    
    def audio_callback(self, in_data, frame_count, time_info, status):
        """Optimized audio callback with minimal processing"""
        if self.recording and status == 0:  # No error
            self.audio_buffer.append(in_data)
        elif status != 0:
            logger.warning(f"Audio callback status: {status}")
        
        return (in_data, pyaudio.paContinue)
    
    async def process_audio_async(self, audio_data: list):
        """Asynchronous audio processing with in-memory handling"""
        try:
            start_time = time.time()
            
            # Convert audio data to numpy array (Gemini's recommendation)
            if self.config['performance']['in_memory_processing']:
                audio_np = self.convert_audio_to_numpy(audio_data)
                text = await self.transcribe_numpy_async(audio_np)
            else:
                # Fallback to file-based processing
                text = await self.transcribe_file_async(audio_data)
            
            processing_time = time.time() - start_time
            
            # Update stats
            self.stats['transcriptions'] += 1
            self.stats['avg_processing_time'] = (
                (self.stats['avg_processing_time'] * (self.stats['transcriptions'] - 1) + processing_time) 
                / self.stats['transcriptions']
            )
            
            if text and text.strip():
                await self.output_text_async(text, processing_time)
            else:
                logger.warning("Empty transcription result")
                
        except Exception as e:
            logger.error(f"Audio processing failed: {e}")
            self.stats['errors'] += 1
    
    def convert_audio_to_numpy(self, audio_data: list) -> np.ndarray:
        """Convert raw audio data to numpy array for direct Whisper processing"""
        try:
            # Concatenate all audio chunks
            raw_audio = b''.join(audio_data)
            
            # Convert to numpy array and normalize
            audio_np = np.frombuffer(raw_audio, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Apply audio enhancements if configured
            if self.config['audio_enhancement']['normalize_volume']:
                audio_np = self.normalize_volume(audio_np)
            
            if self.config['audio_enhancement']['noise_reduction']:
                audio_np = self.reduce_noise(audio_np)
            
            return audio_np
            
        except Exception as e:
            logger.error(f"Audio conversion failed: {e}")
            raise
    
    def normalize_volume(self, audio: np.ndarray) -> np.ndarray:
        """Normalize audio volume"""
        max_val = np.max(np.abs(audio))
        if max_val > 0:
            return audio / max_val * 0.95  # Avoid clipping
        return audio
    
    def reduce_noise(self, audio: np.ndarray) -> np.ndarray:
        """Basic noise reduction using simple filtering"""
        try:
            # Simple high-pass filter to remove low-frequency noise
            from scipy import signal
            b, a = signal.butter(1, 80, btype='high', fs=self.sample_rate)
            return signal.filtfilt(b, a, audio)
        except ImportError:
            logger.warning("scipy not available for noise reduction")
            return audio
        except Exception as e:
            logger.warning(f"Noise reduction failed: {e}")
            return audio
    
    async def transcribe_numpy_async(self, audio_np: np.ndarray) -> str:
        """Transcribe audio from numpy array"""
        try:
            if self.model:
                # Run CPU-intensive transcription in thread pool
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    self.executor, 
                    self.model.transcribe, 
                    audio_np
                )
                return result["text"].strip()
            else:
                raise Exception("No local model available")
                
        except Exception as e:
            logger.error(f"Local transcription failed: {e}")
            if self.config['cloud_fallback']:
                return await self.cloud_transcribe_async(audio_np)
            raise
    
    async def transcribe_file_async(self, audio_data: list) -> str:
        """Fallback file-based transcription"""
        import tempfile
        import wave
        
        temp_file = None
        try:
            # Create temporary file
            temp_file = tempfile.mktemp(suffix='.wav')
            
            with wave.open(temp_file, 'wb') as wf:
                wf.setnchannels(1)
                wf.setsampwidth(self.audio.get_sample_size(pyaudio.paInt16))
                wf.setframerate(self.sample_rate)
                wf.writeframes(b''.join(audio_data))
            
            if self.model:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    self.executor,
                    self.model.transcribe,
                    temp_file
                )
                return result["text"].strip()
            else:
                raise Exception("No local model available")
                
        finally:
            if temp_file and os.path.exists(temp_file):
                os.remove(temp_file)
    
    async def cloud_transcribe_async(self, audio_data) -> str:
        """Asynchronous cloud transcription with retry logic"""
        provider_name = self.config['cloud_provider']
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                if provider_name == 'google':
                    return await self.google_transcribe_async(audio_data)
                elif provider_name == 'azure':
                    return await self.azure_transcribe_async(audio_data)
                else:
                    raise ValueError(f"Unsupported cloud provider: {provider_name}")
                    
            except Exception as e:
                logger.warning(f"Cloud transcription attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise
    
    async def google_transcribe_async(self, audio_data) -> str:
        """Async Google Speech-to-Text transcription"""
        api_key = self.config.get('google_api_key')
        if not api_key:
            raise Exception("Google API key not configured")
        
        # Convert numpy array to base64 for API
        if isinstance(audio_data, np.ndarray):
            import io
            import wave
            import base64
            
            # Convert numpy to WAV bytes
            wav_buffer = io.BytesIO()
            with wave.open(wav_buffer, 'wb') as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(self.sample_rate)
                # Convert float32 back to int16
                audio_int16 = (audio_data * 32767).astype(np.int16)
                wf.writeframes(audio_int16.tobytes())
            
            audio_content = base64.b64encode(wav_buffer.getvalue()).decode('utf-8')
        
        request_data = {
            "config": {
                "encoding": "LINEAR16",
                "sampleRateHertz": self.sample_rate,
                "languageCode": "en-US",
                "enableAutomaticPunctuation": True,
                "enableWordConfidence": True
            },
            "audio": {"content": audio_content}
        }
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key
        }
        
        url = "https://speech.googleapis.com/v1/speech:recognize"
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=request_data) as response:
                if response.status == 200:
                    result = await response.json()
                    if 'results' in result and result['results']:
                        return result['results'][0]['alternatives'][0]['transcript']
                    return ""
                else:
                    error_text = await response.text()
                    raise Exception(f"Google API error {response.status}: {error_text}")
    
    async def azure_transcribe_async(self, audio_data) -> str:
        """Async Azure Speech Services transcription"""
        # Implementation similar to Google but for Azure
        raise NotImplementedError("Azure async transcription not implemented yet")
    
    async def output_text_async(self, text: str, processing_time: float):
        """Asynchronous text output with multiple methods"""
        logger.info(f"Transcribed in {processing_time:.2f}s: {text}")
        
        try:
            # Output to active application
            if self.config['output_options']['auto_type']:
                from .app_handlers import ApplicationHandler
                handler = ApplicationHandler()
                success = handler.handle_text_input(text)
                if not success:
                    logger.warning("Auto-type failed, copying to clipboard")
                    self.copy_to_clipboard(text)
            
            # Copy to clipboard if configured
            if self.config['output_options']['copy_to_clipboard']:
                self.copy_to_clipboard(text)
            
            # Log transcription
            if self.config['security']['log_transcriptions']:
                await self.log_transcription_async(text, processing_time)
            
            # Show notification if configured
            if self.config['output_options']['show_notification']:
                self.show_notification(f"Transcribed: {text[:50]}...")
                
        except Exception as e:
            logger.error(f"Text output failed: {e}")
    
    async def log_transcription_async(self, text: str, processing_time: float):
        """Asynchronously log transcription"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "text": text,
            "processing_time": processing_time,
            "method": "local" if self.model else "cloud",
            "model": self.config['whisper_model'] if self.model else self.config['cloud_provider']
        }
        
        log_file = "logs/transcriptions.json"
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
        # Async file I/O
        import aiofiles
        try:
            # Read existing logs
            logs = []
            if os.path.exists(log_file):
                async with aiofiles.open(log_file, 'r') as f:
                    content = await f.read()
                    if content.strip():
                        logs = json.loads(content)
            
            # Append new log
            logs.append(log_entry)
            
            # Keep only last 1000 entries
            if len(logs) > 1000:
                logs = logs[-1000:]
            
            # Write back
            async with aiofiles.open(log_file, 'w') as f:
                await f.write(json.dumps(logs, indent=2))
                
        except ImportError:
            # Fallback to synchronous file I/O
            logs = []
            if os.path.exists(log_file):
                with open(log_file, 'r') as f:
                    content = f.read()
                    if content.strip():
                        logs = json.loads(content)
            
            logs.append(log_entry)
            if len(logs) > 1000:
                logs = logs[-1000:]
                
            with open(log_file, 'w') as f:
                json.dump(logs, f, indent=2)
    
    def copy_to_clipboard(self, text: str):
        """Copy text to clipboard with cross-platform support"""
        try:
            import pyperclip
            pyperclip.copy(text)
            return True
        except ImportError:
            try:
                import subprocess
                subprocess.run(['xclip', '-selection', 'clipboard'], 
                             input=text, text=True, check=True)
                return True
            except (subprocess.CalledProcessError, FileNotFoundError):
                logger.error("Clipboard copy failed - no clipboard utility available")
                return False
    
    def show_notification(self, message: str):
        """Show desktop notification"""
        try:
            import subprocess
            subprocess.run(['notify-send', 'Voice Assistant', message], 
                         check=False)  # Don't fail if notify-send unavailable
        except FileNotFoundError:
            logger.debug("notify-send not available for notifications")
    
    def toggle_recording(self):
        """Thread-safe recording toggle"""
        try:
            self.command_queue.put('toggle', block=False)
        except queue.Full:
            logger.warning("Command queue full, ignoring toggle request")
    
    def hotkey_listener(self):
        """Dedicated thread for hotkey handling"""
        logger.info(f"Hotkey listener started for: {self.config['hotkey']}")
        
        try:
            keyboard.add_hotkey(self.config['hotkey'], self.toggle_recording)
            
            while self.running:
                time.sleep(0.1)
                
        except Exception as e:
            logger.error(f"Hotkey listener error: {e}")
        finally:
            try:
                keyboard.clear_all_hotkeys()
            except:
                pass
    
    async def command_processor(self):
        """Process commands from hotkey thread"""
        while self.running:
            try:
                command = self.command_queue.get(timeout=0.1)
                if command == 'toggle':
                    if self.recording:
                        self.stop_recording()
                    else:
                        self.start_recording()
                        
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Command processing error: {e}")
    
    async def audio_processor(self):
        """Process audio from queue"""
        while self.running:
            try:
                audio_data = self.audio_queue.get(timeout=0.1)
                await self.process_audio_async(audio_data)
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Audio processing error: {e}")
    
    async def run_async(self):
        """Main async event loop"""
        logger.info("Starting Voice Assistant (Optimized)")
        logger.info(f"Press {self.config['hotkey']} to toggle recording")
        logger.info("Press Ctrl+C to quit")
        
        self.running = True
        
        # Start hotkey listener in separate thread
        self.hotkey_thread = threading.Thread(target=self.hotkey_listener, daemon=True)
        self.hotkey_thread.start()
        
        try:
            # Run async tasks
            await asyncio.gather(
                self.command_processor(),
                self.audio_processor()
            )
        except KeyboardInterrupt:
            logger.info("Shutdown requested")
        finally:
            await self.cleanup()
    
    async def cleanup(self):
        """Clean shutdown"""
        logger.info("Cleaning up...")
        self.running = False
        
        if self.recording:
            self.stop_recording()
        
        if hasattr(self, 'stream') and self.stream:
            self.stream.close()
        
        if hasattr(self, 'audio') and self.audio:
            self.audio.terminate()
        
        self.executor.shutdown(wait=True)
        
        # Print final stats
        logger.info(f"Session stats: {self.stats['transcriptions']} transcriptions, "
                   f"{self.stats['errors']} errors, "
                   f"avg processing time: {self.stats['avg_processing_time']:.2f}s")
    
    def run(self):
        """Synchronous entry point"""
        try:
            asyncio.run(self.run_async())
        except KeyboardInterrupt:
            pass

def main():
    """Main entry point with enhanced error handling"""
    try:
        # Ensure log directory exists
        os.makedirs('logs', exist_ok=True)
        
        assistant = OptimizedVoiceAssistant()
        assistant.run()
        
    except Exception as e:
        logger.error(f"Failed to start Voice Assistant: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
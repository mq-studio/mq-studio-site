#!/usr/bin/env python3
"""
Native Messaging Host for Voice Assistant Browser Extension

This script handles communication between the browser extension and the 
local Python voice service. It implements the Chrome Native Messaging protocol.
"""

import sys
import json
import struct
import asyncio
import logging
import tempfile
import base64
import wave
import numpy as np
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent / 'src'))

try:
    from optimized_voice_service import OptimizedVoiceAssistant
except ImportError as e:
    logging.error(f"Failed to import voice service: {e}")
    sys.exit(1)

# Configure logging for native messaging
logging.basicConfig(
    filename='/tmp/voice_assistant_host.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class NativeMessagingHost:
    def __init__(self):
        self.voice_assistant = None
        self.setup_voice_assistant()
    
    def setup_voice_assistant(self):
        """Initialize the voice assistant"""
        try:
            config_path = Path(__file__).parent.parent / 'config' / 'config.json'
            self.voice_assistant = OptimizedVoiceAssistant(str(config_path))
            logger.info("Voice assistant initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize voice assistant: {e}")
            self.voice_assistant = None
    
    def read_message(self):
        """Read a message from the browser extension"""
        try:
            # Read the message length (4 bytes, native byte order)
            raw_length = sys.stdin.buffer.read(4)
            if not raw_length:
                return None
            
            message_length = struct.unpack('@I', raw_length)[0]
            
            # Read the message
            message = sys.stdin.buffer.read(message_length).decode('utf-8')
            
            return json.loads(message)
        
        except Exception as e:
            logger.error(f"Error reading message: {e}")
            return None
    
    def send_message(self, message):
        """Send a message to the browser extension"""
        try:
            # Encode the message
            encoded_message = json.dumps(message).encode('utf-8')
            encoded_length = struct.pack('@I', len(encoded_message))
            
            # Write the message length and then the message
            sys.stdout.buffer.write(encoded_length)
            sys.stdout.buffer.write(encoded_message)
            sys.stdout.buffer.flush()
            
            logger.debug(f"Sent message: {message}")
            
        except Exception as e:
            logger.error(f"Error sending message: {e}")
    
    def send_error(self, error_message, request_id=None):
        """Send an error response"""
        response = {
            "type": "error",
            "error": error_message,
            "timestamp": str(asyncio.get_event_loop().time())
        }
        
        if request_id:
            response["requestId"] = request_id
        
        self.send_message(response)
    
    def send_success(self, data, request_id=None):
        """Send a success response"""
        response = {
            "type": "success",
            "data": data,
            "timestamp": str(asyncio.get_event_loop().time())
        }
        
        if request_id:
            response["requestId"] = request_id
        
        self.send_message(response)
    
    async def process_audio_blob(self, audio_data_b64, audio_format="webm"):
        """Process audio blob from browser"""
        if not self.voice_assistant:
            raise Exception("Voice assistant not initialized")
        
        try:
            # Decode base64 audio data
            audio_data = base64.b64decode(audio_data_b64)
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix=f'.{audio_format}', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Convert to WAV if needed (browser usually sends WebM)
                if audio_format.lower() != 'wav':
                    wav_path = await self.convert_to_wav(temp_file_path)
                else:
                    wav_path = temp_file_path
                
                # Load audio as numpy array
                audio_np = self.load_audio_as_numpy(wav_path)
                
                # Transcribe using the voice assistant
                text = await self.voice_assistant.transcribe_numpy_async(audio_np)
                
                return text
                
            finally:
                # Clean up temporary files
                try:
                    Path(temp_file_path).unlink()
                    if 'wav_path' in locals() and wav_path != temp_file_path:
                        Path(wav_path).unlink()
                except:
                    pass
                    
        except Exception as e:
            logger.error(f"Audio processing failed: {e}")
            raise
    
    async def convert_to_wav(self, input_path):
        """Convert audio file to WAV format using FFmpeg"""
        try:
            import subprocess
            import tempfile
            
            # Create output WAV file
            wav_path = tempfile.mktemp(suffix='.wav')
            
            # Use FFmpeg to convert
            cmd = [
                'ffmpeg', '-i', input_path,
                '-acodec', 'pcm_s16le',
                '-ar', '16000',
                '-ac', '1',
                '-y',  # Overwrite output
                wav_path
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                raise Exception(f"FFmpeg conversion failed: {stderr.decode()}")
            
            return wav_path
            
        except FileNotFoundError:
            raise Exception("FFmpeg not found. Please install FFmpeg for audio conversion.")
        except Exception as e:
            raise Exception(f"Audio conversion failed: {e}")
    
    def load_audio_as_numpy(self, wav_path):
        """Load WAV file as numpy array"""
        try:
            with wave.open(wav_path, 'rb') as wf:
                frames = wf.readframes(wf.getnframes())
                sample_rate = wf.getframerate()
                
                # Convert to numpy array
                audio_data = np.frombuffer(frames, dtype=np.int16)
                
                # Convert to float32 and normalize
                audio_np = audio_data.astype(np.float32) / 32768.0
                
                # Resample to 16kHz if needed
                if sample_rate != 16000:
                    audio_np = self.resample_audio(audio_np, sample_rate, 16000)
                
                return audio_np
                
        except Exception as e:
            raise Exception(f"Failed to load audio: {e}")
    
    def resample_audio(self, audio, orig_sr, target_sr):
        """Simple audio resampling"""
        try:
            import librosa
            return librosa.resample(audio, orig_sr=orig_sr, target_sr=target_sr)
        except ImportError:
            # Fallback: simple decimation/interpolation
            ratio = target_sr / orig_sr
            if ratio < 1:
                # Downsample
                step = int(1 / ratio)
                return audio[::step]
            else:
                # Upsample (simple repeat)
                repeat_factor = int(ratio)
                return np.repeat(audio, repeat_factor)
    
    async def handle_transcribe_request(self, message):
        """Handle transcription request from browser"""
        try:
            request_id = message.get('requestId')
            audio_data = message.get('audioData')
            audio_format = message.get('audioFormat', 'webm')
            
            if not audio_data:
                raise Exception("No audio data provided")
            
            logger.info(f"Processing transcription request {request_id}")
            
            # Process the audio
            text = await self.process_audio_blob(audio_data, audio_format)
            
            # Send response
            self.send_success({
                "transcription": text,
                "confidence": 0.95,  # Placeholder confidence score
                "processingTime": 1.5  # Placeholder processing time
            }, request_id)
            
            logger.info(f"Transcription completed: {text[:50]}...")
            
        except Exception as e:
            logger.error(f"Transcription request failed: {e}")
            self.send_error(str(e), message.get('requestId'))
    
    async def handle_status_request(self, message):
        """Handle status request from browser"""
        try:
            status = {
                "available": self.voice_assistant is not None,
                "model": self.voice_assistant.config.get('whisper_model') if self.voice_assistant else None,
                "cloudFallback": self.voice_assistant.config.get('cloud_fallback') if self.voice_assistant else False,
                "version": "1.0.0"
            }
            
            self.send_success(status, message.get('requestId'))
            
        except Exception as e:
            logger.error(f"Status request failed: {e}")
            self.send_error(str(e), message.get('requestId'))
    
    async def handle_config_request(self, message):
        """Handle configuration request from browser"""
        try:
            if not self.voice_assistant:
                raise Exception("Voice assistant not available")
            
            # Return safe subset of configuration
            safe_config = {
                "whisperModel": self.voice_assistant.config.get('whisper_model'),
                "sampleRate": self.voice_assistant.config.get('sample_rate'),
                "cloudFallback": self.voice_assistant.config.get('cloud_fallback'),
                "audioEnhancement": self.voice_assistant.config.get('audio_enhancement', {}),
                "outputOptions": self.voice_assistant.config.get('output_options', {})
            }
            
            self.send_success(safe_config, message.get('requestId'))
            
        except Exception as e:
            logger.error(f"Config request failed: {e}")
            self.send_error(str(e), message.get('requestId'))
    
    async def process_message(self, message):
        """Process incoming message from browser"""
        try:
            message_type = message.get('type')
            
            if message_type == 'transcribe':
                await self.handle_transcribe_request(message)
            elif message_type == 'status':
                await self.handle_status_request(message)
            elif message_type == 'config':
                await self.handle_config_request(message)
            else:
                self.send_error(f"Unknown message type: {message_type}", message.get('requestId'))
                
        except Exception as e:
            logger.error(f"Message processing failed: {e}")
            self.send_error(str(e), message.get('requestId'))
    
    async def run(self):
        """Main message processing loop"""
        logger.info("Native messaging host started")
        
        try:
            while True:
                # Read message from browser
                message = self.read_message()
                
                if message is None:
                    logger.info("Browser disconnected or no more messages")
                    break
                
                logger.debug(f"Received message: {message}")
                
                # Process the message
                await self.process_message(message)
                
        except Exception as e:
            logger.error(f"Main loop error: {e}")
        finally:
            logger.info("Native messaging host stopped")

def main():
    """Main entry point"""
    try:
        host = NativeMessagingHost()
        asyncio.run(host.run())
    except Exception as e:
        logger.error(f"Host startup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
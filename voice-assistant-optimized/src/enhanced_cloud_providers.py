"""
Enhanced Cloud Providers with Resilience and Error Handling
Implements Gemini's recommendations for retry logic and robust error handling
"""

import asyncio
import aiohttp
import base64
import json
import os
import time
import logging
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class TranscriptionError(Exception):
    """Custom exception for transcription errors"""
    pass

class CloudProviderError(TranscriptionError):
    """Errors specific to cloud provider issues"""
    pass

class RetryableError(CloudProviderError):
    """Errors that should trigger retry logic"""
    pass

class NonRetryableError(CloudProviderError):
    """Errors that should not be retried"""
    pass

@dataclass
class TranscriptionResult:
    """Structured result from transcription"""
    text: str
    confidence: float
    processing_time: float
    provider: str
    word_count: int = 0
    language: str = "en-US"

class RetryStrategy(Enum):
    EXPONENTIAL_BACKOFF = "exponential"
    LINEAR_BACKOFF = "linear"
    FIXED_DELAY = "fixed"

class EnhancedCloudProvider(ABC):
    """Enhanced base class for cloud providers with retry logic"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.max_retries = config.get('max_retries', 3)
        self.retry_strategy = RetryStrategy(config.get('retry_strategy', 'exponential'))
        self.base_delay = config.get('base_delay', 1.0)
        self.max_delay = config.get('max_delay', 30.0)
        self.timeout = config.get('timeout', 30.0)
        
        # Session for connection pooling
        self.session = None
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = config.get('min_request_interval', 0.1)
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.timeout),
            connector=aiohttp.TCPConnector(limit=10, limit_per_host=5)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    def calculate_delay(self, attempt: int) -> float:
        """Calculate delay for retry attempt"""
        if self.retry_strategy == RetryStrategy.EXPONENTIAL_BACKOFF:
            delay = self.base_delay * (2 ** attempt)
        elif self.retry_strategy == RetryStrategy.LINEAR_BACKOFF:
            delay = self.base_delay * (attempt + 1)
        else:  # FIXED_DELAY
            delay = self.base_delay
        
        return min(delay, self.max_delay)
    
    async def rate_limit(self):
        """Enforce rate limiting"""
        now = time.time()
        time_since_last = now - self.last_request_time
        
        if time_since_last < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last
            await asyncio.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    async def transcribe_with_retry(self, audio_file_path: str) -> TranscriptionResult:
        """Transcribe with automatic retry logic"""
        last_exception = None
        
        for attempt in range(self.max_retries + 1):
            try:
                # Rate limiting
                await self.rate_limit()
                
                # Attempt transcription
                start_time = time.time()
                result = await self._transcribe_impl(audio_file_path)
                processing_time = time.time() - start_time
                
                # Validate result
                if not result or not result.strip():
                    if attempt < self.max_retries:
                        logger.warning(f"Empty result on attempt {attempt + 1}, retrying...")
                        await asyncio.sleep(self.calculate_delay(attempt))
                        continue
                    else:
                        return TranscriptionResult(
                            text="", 
                            confidence=0.0, 
                            processing_time=processing_time,
                            provider=self.__class__.__name__
                        )
                
                # Success
                return TranscriptionResult(
                    text=result.strip(),
                    confidence=0.95,  # Most providers don't return confidence
                    processing_time=processing_time,
                    provider=self.__class__.__name__,
                    word_count=len(result.split())
                )
                
            except NonRetryableError as e:
                logger.error(f"Non-retryable error: {e}")
                raise
                
            except RetryableError as e:
                last_exception = e
                if attempt < self.max_retries:
                    delay = self.calculate_delay(attempt)
                    logger.warning(f"Retryable error on attempt {attempt + 1}: {e}. "
                                 f"Retrying in {delay:.1f}s...")
                    await asyncio.sleep(delay)
                else:
                    logger.error(f"Max retries ({self.max_retries}) exceeded")
                    raise
            
            except Exception as e:
                # Classify unknown errors as retryable for safety
                last_exception = RetryableError(f"Unknown error: {e}")
                if attempt < self.max_retries:
                    delay = self.calculate_delay(attempt)
                    logger.warning(f"Unknown error on attempt {attempt + 1}: {e}. "
                                 f"Retrying in {delay:.1f}s...")
                    await asyncio.sleep(delay)
                else:
                    logger.error(f"Max retries ({self.max_retries}) exceeded")
                    raise last_exception
        
        # Should not reach here, but just in case
        raise last_exception or TranscriptionError("Transcription failed after all retries")
    
    @abstractmethod
    async def _transcribe_impl(self, audio_file_path: str) -> str:
        """Implementation-specific transcription logic"""
        pass
    
    def validate_config(self) -> bool:
        """Validate provider configuration"""
        return True

class EnhancedGoogleSpeechToText(EnhancedCloudProvider):
    """Enhanced Google Speech-to-Text with resilience"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get('google_api_key') or os.getenv('GOOGLE_SPEECH_API_KEY')
        self.endpoint = "https://speech.googleapis.com/v1/speech:recognize"
        
        if not self.api_key:
            raise NonRetryableError("Google Speech API key not configured")
    
    def validate_config(self) -> bool:
        """Validate Google-specific configuration"""
        if not self.api_key:
            logger.error("Google API key not found")
            return False
        
        if len(self.api_key) < 20:  # Basic validation
            logger.error("Google API key appears invalid")
            return False
        
        return True
    
    async def _transcribe_impl(self, audio_file_path: str) -> str:
        """Google Speech-to-Text implementation"""
        try:
            # Read and encode audio file
            with open(audio_file_path, 'rb') as audio_file:
                audio_content = base64.b64encode(audio_file.read()).decode('utf-8')
            
            # Prepare request
            request_data = {
                "config": {
                    "encoding": "LINEAR16",
                    "sampleRateHertz": 16000,
                    "languageCode": "en-US",
                    "enableAutomaticPunctuation": True,
                    "enableWordConfidence": True,
                    "maxAlternatives": 1,
                    "profanityFilter": False,
                    "enableSpokenPunctuation": True,
                    "enableSpokenEmojis": False
                },
                "audio": {
                    "content": audio_content
                }
            }
            
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
                "User-Agent": "VoiceAssistant/1.0"
            }
            
            # Make request
            async with self.session.post(
                self.endpoint,
                headers=headers,
                json=request_data
            ) as response:
                
                response_text = await response.text()
                
                # Handle different error conditions
                if response.status == 401:
                    raise NonRetryableError("Invalid API key")
                elif response.status == 403:
                    raise NonRetryableError("API access forbidden")
                elif response.status == 429:
                    raise RetryableError("Rate limit exceeded")
                elif response.status >= 500:
                    raise RetryableError(f"Server error: {response.status}")
                elif response.status != 200:
                    raise RetryableError(f"HTTP {response.status}: {response_text}")
                
                # Parse response
                try:
                    result = json.loads(response_text)
                except json.JSONDecodeError as e:
                    raise RetryableError(f"Invalid JSON response: {e}")
                
                # Extract transcription
                if 'results' in result and result['results']:
                    alternatives = result['results'][0].get('alternatives', [])
                    if alternatives:
                        return alternatives[0].get('transcript', '')
                
                # No results
                return ""
                
        except aiohttp.ClientError as e:
            raise RetryableError(f"Network error: {e}")
        except FileNotFoundError:
            raise NonRetryableError(f"Audio file not found: {audio_file_path}")
        except Exception as e:
            raise RetryableError(f"Unexpected error: {e}")

class EnhancedAzureSpeechService(EnhancedCloudProvider):
    """Enhanced Azure Speech Services with resilience"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.subscription_key = (config.get('azure_subscription_key') or 
                               os.getenv('AZURE_SPEECH_KEY'))
        self.region = config.get('azure_region') or os.getenv('AZURE_SPEECH_REGION', 'eastus')
        
        if not self.subscription_key:
            raise NonRetryableError("Azure Speech subscription key not configured")
        
        self.endpoint = (f"https://{self.region}.stt.speech.microsoft.com/"
                        f"speech/recognition/conversation/cognitiveservices/v1")
    
    def validate_config(self) -> bool:
        """Validate Azure-specific configuration"""
        if not self.subscription_key:
            logger.error("Azure subscription key not found")
            return False
        
        if not self.region:
            logger.error("Azure region not configured")
            return False
        
        return True
    
    async def _transcribe_impl(self, audio_file_path: str) -> str:
        """Azure Speech Services implementation"""
        try:
            headers = {
                "Ocp-Apim-Subscription-Key": self.subscription_key,
                "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
                "Accept": "application/json"
            }
            
            params = {
                "language": "en-US",
                "format": "detailed",
                "profanity": "raw"
            }
            
            # Read audio file
            with open(audio_file_path, 'rb') as audio_file:
                audio_data = audio_file.read()
            
            # Make request
            async with self.session.post(
                self.endpoint,
                headers=headers,
                params=params,
                data=audio_data
            ) as response:
                
                response_text = await response.text()
                
                # Handle errors
                if response.status == 401:
                    raise NonRetryableError("Invalid subscription key")
                elif response.status == 403:
                    raise NonRetryableError("Access forbidden")
                elif response.status == 429:
                    raise RetryableError("Rate limit exceeded")
                elif response.status >= 500:
                    raise RetryableError(f"Server error: {response.status}")
                elif response.status != 200:
                    raise RetryableError(f"HTTP {response.status}: {response_text}")
                
                # Parse response
                try:
                    result = json.loads(response_text)
                except json.JSONDecodeError as e:
                    raise RetryableError(f"Invalid JSON response: {e}")
                
                # Extract transcription
                return result.get('DisplayText', '')
                
        except aiohttp.ClientError as e:
            raise RetryableError(f"Network error: {e}")
        except FileNotFoundError:
            raise NonRetryableError(f"Audio file not found: {audio_file_path}")
        except Exception as e:
            raise RetryableError(f"Unexpected error: {e}")

class EnhancedAWSTranscribe(EnhancedCloudProvider):
    """Enhanced AWS Transcribe with resilience"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.access_key = config.get('aws_access_key') or os.getenv('AWS_ACCESS_KEY_ID')
        self.secret_key = config.get('aws_secret_key') or os.getenv('AWS_SECRET_ACCESS_KEY')
        self.region = config.get('aws_region', 'us-east-1')
        
        if not self.access_key or not self.secret_key:
            raise NonRetryableError("AWS credentials not configured")
    
    def validate_config(self) -> bool:
        """Validate AWS-specific configuration"""
        if not self.access_key or not self.secret_key:
            logger.error("AWS credentials not found")
            return False
        
        return True
    
    async def _transcribe_impl(self, audio_file_path: str) -> str:
        """AWS Transcribe implementation (simplified for real-time use)"""
        # Note: AWS Transcribe is typically asynchronous and designed for longer audio
        # This is a simplified implementation for demonstration
        raise NotImplementedError("AWS Transcribe real-time implementation not available")

class CloudProviderFactory:
    """Factory for creating cloud providers with enhanced error handling"""
    
    @staticmethod
    def create_provider(provider_name: str, config: Dict[str, Any]) -> EnhancedCloudProvider:
        """Create a cloud provider instance"""
        
        providers = {
            'google': EnhancedGoogleSpeechToText,
            'azure': EnhancedAzureSpeechService,
            'aws': EnhancedAWSTranscribe
        }
        
        provider_class = providers.get(provider_name.lower())
        if not provider_class:
            raise ValueError(f"Unsupported cloud provider: {provider_name}")
        
        try:
            provider = provider_class(config)
            
            # Validate configuration
            if not provider.validate_config():
                raise NonRetryableError(f"{provider_name} configuration validation failed")
            
            return provider
            
        except Exception as e:
            logger.error(f"Failed to create {provider_name} provider: {e}")
            raise

class CloudTranscriptionManager:
    """Manager for handling multiple cloud providers with fallback"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.primary_provider = config.get('primary_provider', 'google')
        self.fallback_providers = config.get('fallback_providers', [])
        self.providers = {}
        
        # Initialize providers
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize all configured providers"""
        all_providers = [self.primary_provider] + self.fallback_providers
        
        for provider_name in set(all_providers):  # Remove duplicates
            try:
                provider = CloudProviderFactory.create_provider(provider_name, self.config)
                self.providers[provider_name] = provider
                logger.info(f"Initialized {provider_name} provider")
            except Exception as e:
                logger.warning(f"Failed to initialize {provider_name} provider: {e}")
    
    async def transcribe(self, audio_file_path: str) -> TranscriptionResult:
        """Transcribe with automatic fallback to other providers"""
        
        # Try primary provider first
        if self.primary_provider in self.providers:
            try:
                async with self.providers[self.primary_provider] as provider:
                    return await provider.transcribe_with_retry(audio_file_path)
            except Exception as e:
                logger.warning(f"Primary provider {self.primary_provider} failed: {e}")
        
        # Try fallback providers
        for provider_name in self.fallback_providers:
            if provider_name in self.providers and provider_name != self.primary_provider:
                try:
                    logger.info(f"Trying fallback provider: {provider_name}")
                    async with self.providers[provider_name] as provider:
                        return await provider.transcribe_with_retry(audio_file_path)
                except Exception as e:
                    logger.warning(f"Fallback provider {provider_name} failed: {e}")
        
        # All providers failed
        raise CloudProviderError("All cloud providers failed")
    
    async def health_check(self) -> Dict[str, bool]:
        """Check health of all providers"""
        health_status = {}
        
        for provider_name, provider in self.providers.items():
            try:
                # Simple validation check
                health_status[provider_name] = provider.validate_config()
            except Exception as e:
                logger.error(f"Health check failed for {provider_name}: {e}")
                health_status[provider_name] = False
        
        return health_status

# Example usage and configuration
def create_cloud_config() -> Dict[str, Any]:
    """Create a sample configuration for cloud providers"""
    return {
        # Provider selection
        'primary_provider': 'google',
        'fallback_providers': ['azure'],
        
        # Retry configuration
        'max_retries': 3,
        'retry_strategy': 'exponential',
        'base_delay': 1.0,
        'max_delay': 30.0,
        'timeout': 30.0,
        
        # Rate limiting
        'min_request_interval': 0.1,
        
        # Google Speech-to-Text
        'google_api_key': None,  # Will use environment variable
        
        # Azure Speech Services
        'azure_subscription_key': None,  # Will use environment variable
        'azure_region': 'eastus',
        
        # AWS Transcribe
        'aws_access_key': None,  # Will use environment variable
        'aws_secret_key': None,  # Will use environment variable
        'aws_region': 'us-east-1'
    }

# Example usage
async def example_usage():
    """Example of how to use the enhanced cloud providers"""
    config = create_cloud_config()
    
    try:
        manager = CloudTranscriptionManager(config)
        
        # Health check
        health = await manager.health_check()
        logger.info(f"Provider health: {health}")
        
        # Transcribe audio
        result = await manager.transcribe("path/to/audio.wav")
        
        logger.info(f"Transcription: {result.text}")
        logger.info(f"Confidence: {result.confidence}")
        logger.info(f"Processing time: {result.processing_time:.2f}s")
        logger.info(f"Provider: {result.provider}")
        
    except Exception as e:
        logger.error(f"Transcription failed: {e}")

if __name__ == "__main__":
    # Example run
    logging.basicConfig(level=logging.INFO)
    asyncio.run(example_usage())
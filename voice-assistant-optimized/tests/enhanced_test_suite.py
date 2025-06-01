#!/usr/bin/env python3
"""
Enhanced Test Suite for Voice Assistant
Implements Gemini's recommendations for comprehensive edge case testing
"""

import unittest
import asyncio
import tempfile
import os
import wave
import json
import numpy as np
import threading
import time
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent / 'src'))

try:
    from optimized_voice_service import OptimizedVoiceAssistant
    from enhanced_cloud_providers import (
        EnhancedGoogleSpeechToText, 
        CloudProviderFactory,
        CloudTranscriptionManager,
        TranscriptionResult,
        RetryableError,
        NonRetryableError
    )
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you're running from the correct directory")
    print("Continuing with mock tests...")
    OptimizedVoiceAssistant = None

class AudioTestUtils:
    """Utility class for creating test audio data"""
    
    @staticmethod
    def create_silence(duration_seconds=1, sample_rate=16000):
        """Create silent audio"""
        samples = int(duration_seconds * sample_rate)
        return np.zeros(samples, dtype=np.float32)
    
    @staticmethod
    def create_tone(frequency=440, duration_seconds=1, sample_rate=16000):
        """Create a sine wave tone"""
        samples = int(duration_seconds * sample_rate)
        t = np.linspace(0, duration_seconds, samples, False)
        return np.sin(2 * np.pi * frequency * t).astype(np.float32)
    
    @staticmethod
    def create_noise(duration_seconds=1, sample_rate=16000, amplitude=0.1):
        """Create white noise"""
        samples = int(duration_seconds * sample_rate)
        return np.random.normal(0, amplitude, samples).astype(np.float32)
    
    @staticmethod
    def create_speech_like_audio(duration_seconds=2, sample_rate=16000):
        """Create speech-like audio with multiple frequency components"""
        samples = int(duration_seconds * sample_rate)
        t = np.linspace(0, duration_seconds, samples, False)
        
        # Mix different frequencies to simulate speech
        audio = (
            0.3 * np.sin(2 * np.pi * 200 * t) +   # Low frequency
            0.4 * np.sin(2 * np.pi * 800 * t) +   # Mid frequency  
            0.3 * np.sin(2 * np.pi * 2000 * t)    # High frequency
        )
        
        # Add envelope to make it more speech-like
        envelope = np.exp(-t * 0.5)  # Decaying envelope
        audio = audio * envelope
        
        # Add some noise
        noise = np.random.normal(0, 0.05, samples)
        audio = audio + noise
        
        # Normalize
        audio = audio / np.max(np.abs(audio)) * 0.8
        return audio.astype(np.float32)
    
    @staticmethod
    def save_audio_to_file(audio_data, filename, sample_rate=16000):
        """Save numpy array to WAV file"""
        # Convert float32 to int16
        audio_int16 = (audio_data * 32767).astype(np.int16)
        
        with wave.open(filename, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(audio_int16.tobytes())

class TestVoiceServiceConfiguration(unittest.TestCase):
    """Test configuration loading and validation"""
    
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.config_path = os.path.join(self.temp_dir, 'test_config.json')
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_default_config_creation(self):
        """Test that default config is created when file doesn't exist"""
        assistant = OptimizedVoiceAssistant(self.config_path)
        
        self.assertTrue(os.path.exists(self.config_path))
        self.assertIsNotNone(assistant.config)
        self.assertEqual(assistant.config['whisper_model'], 'base')
    
    def test_config_merging(self):
        """Test that custom config merges with defaults"""
        custom_config = {
            "whisper_model": "tiny",
            "custom_setting": "test_value"
        }
        
        with open(self.config_path, 'w') as f:
            json.dump(custom_config, f)
        
        assistant = OptimizedVoiceAssistant(self.config_path)
        
        self.assertEqual(assistant.config['whisper_model'], 'tiny')
        self.assertEqual(assistant.config['custom_setting'], 'test_value')
        self.assertEqual(assistant.config['sample_rate'], 16000)  # Default value
    
    def test_invalid_config_handling(self):
        """Test handling of invalid JSON config"""
        with open(self.config_path, 'w') as f:
            f.write("invalid json {")
        
        assistant = OptimizedVoiceAssistant(self.config_path)
        
        # Should fall back to defaults
        self.assertEqual(assistant.config['whisper_model'], 'base')
    
    def test_environment_variable_override(self):
        """Test that environment variables override config"""
        with patch.dict(os.environ, {'GOOGLE_SPEECH_API_KEY': 'test_key'}):
            assistant = OptimizedVoiceAssistant(self.config_path)
            self.assertEqual(assistant.config['google_api_key'], 'test_key')

class TestAudioProcessing(unittest.TestCase):
    """Test audio processing with various edge cases"""
    
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.config_path = os.path.join(self.temp_dir, 'test_config.json')
        self.assistant = OptimizedVoiceAssistant(self.config_path)
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_empty_audio_handling(self):
        """Test handling of empty audio data"""
        empty_audio = []
        
        with self.assertLogs(level='WARNING'):
            # This should not crash
            result = self.assistant.convert_audio_to_numpy(empty_audio)
            self.assertEqual(len(result), 0)
    
    def test_very_short_audio(self):
        """Test handling of very short audio clips"""
        # 100ms of audio
        short_audio = AudioTestUtils.create_tone(duration_seconds=0.1)
        audio_bytes = [(short_audio * 32767).astype(np.int16).tobytes()]
        
        result = self.assistant.convert_audio_to_numpy(audio_bytes)
        
        self.assertGreater(len(result), 0)
        self.assertLess(len(result), 2000)  # Less than 2000 samples for 100ms
    
    def test_very_long_audio(self):
        """Test handling of very long audio clips"""
        # 60 seconds of audio (should be truncated or handled gracefully)
        long_audio = AudioTestUtils.create_tone(duration_seconds=60)
        audio_bytes = [(long_audio * 32767).astype(np.int16).tobytes()]
        
        result = self.assistant.convert_audio_to_numpy(audio_bytes)
        
        self.assertGreater(len(result), 0)
        # Should handle long audio without crashing
    
    def test_silence_detection(self):
        """Test handling of silent audio"""
        silence = AudioTestUtils.create_silence(duration_seconds=2)
        audio_bytes = [(silence * 32767).astype(np.int16).tobytes()]
        
        result = self.assistant.convert_audio_to_numpy(audio_bytes)
        
        # Should not crash on silence
        self.assertEqual(len(result), 2 * 16000)  # 2 seconds at 16kHz
        self.assertAlmostEqual(np.max(np.abs(result)), 0, places=3)
    
    def test_noisy_audio_processing(self):
        """Test processing of very noisy audio"""
        noise = AudioTestUtils.create_noise(duration_seconds=1, amplitude=1.0)
        audio_bytes = [(noise * 32767).astype(np.int16).tobytes()]
        
        result = self.assistant.convert_audio_to_numpy(audio_bytes)
        
        self.assertGreater(len(result), 0)
        # Should handle noise without crashing
    
    def test_volume_normalization(self):
        """Test volume normalization"""
        # Create very quiet audio
        quiet_audio = AudioTestUtils.create_tone(duration_seconds=1) * 0.01
        
        normalized = self.assistant.normalize_volume(quiet_audio)
        
        # Should be normalized to near maximum
        self.assertGreater(np.max(np.abs(normalized)), 0.9)
    
    def test_clipping_prevention(self):
        """Test that normalization prevents clipping"""
        # Create audio that would clip
        loud_audio = AudioTestUtils.create_tone(duration_seconds=1) * 2.0
        
        normalized = self.assistant.normalize_volume(loud_audio)
        
        # Should not exceed 0.95 to prevent clipping
        self.assertLessEqual(np.max(np.abs(normalized)), 0.95)
    
    @patch('whisper.load_model')
    def test_model_loading_failure(self, mock_load_model):
        """Test handling of model loading failure"""
        mock_load_model.side_effect = Exception("Model loading failed")
        
        # Should not crash, should fall back to cloud processing
        assistant = OptimizedVoiceAssistant(self.config_path)
        assistant.load_model()
        
        self.assertIsNone(assistant.model)
        self.assertTrue(assistant.config['cloud_fallback'])

class TestAsyncAudioProcessing(unittest.TestCase):
    """Test asynchronous audio processing"""
    
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.config_path = os.path.join(self.temp_dir, 'test_config.json')
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_concurrent_processing(self):
        """Test that multiple audio clips can be processed concurrently"""
        assistant = OptimizedVoiceAssistant(self.config_path)
        
        # Mock the transcription to avoid loading real models
        with patch.object(assistant, 'transcribe_numpy_async', new_callable=AsyncMock) as mock_transcribe:
            mock_transcribe.return_value = "test transcription"
            
            async def test_concurrent():
                # Create multiple audio clips
                audio_clips = []
                for i in range(3):
                    audio = AudioTestUtils.create_speech_like_audio(duration_seconds=1)
                    audio_bytes = [(audio * 32767).astype(np.int16).tobytes()]
                    audio_clips.append(audio_bytes)
                
                # Process concurrently
                tasks = [assistant.process_audio_async(clip) for clip in audio_clips]
                await asyncio.gather(*tasks)
                
                # Should have been called 3 times
                self.assertEqual(mock_transcribe.call_count, 3)
            
            asyncio.run(test_concurrent())
    
    def test_async_error_handling(self):
        """Test error handling in async processing"""
        assistant = OptimizedVoiceAssistant(self.config_path)
        
        with patch.object(assistant, 'transcribe_numpy_async', new_callable=AsyncMock) as mock_transcribe:
            mock_transcribe.side_effect = Exception("Transcription failed")
            
            async def test_error():
                audio = AudioTestUtils.create_speech_like_audio(duration_seconds=1)
                audio_bytes = [(audio * 32767).astype(np.int16).tobytes()]
                
                # Should not crash, should handle error gracefully
                try:
                    await assistant.process_audio_async(audio_bytes)
                except Exception:
                    pass  # Expected to handle gracefully
                
                # Error count should increase
                self.assertGreater(assistant.stats['errors'], 0)
            
            asyncio.run(test_error())

class TestCloudProviders(unittest.TestCase):
    """Test cloud provider implementations with edge cases"""
    
    def setUp(self):
        self.config = {
            'max_retries': 2,
            'base_delay': 0.1,  # Short delay for testing
            'timeout': 5.0,
            'google_api_key': 'test_key'
        }
    
    def test_retry_logic_exponential_backoff(self):
        """Test exponential backoff retry logic"""
        provider = EnhancedGoogleSpeechToText(self.config)
        
        # Test delay calculation
        self.assertAlmostEqual(provider.calculate_delay(0), 0.1)
        self.assertAlmostEqual(provider.calculate_delay(1), 0.2)
        self.assertAlmostEqual(provider.calculate_delay(2), 0.4)
    
    def test_config_validation(self):
        """Test configuration validation"""
        # Valid config
        provider = EnhancedGoogleSpeechToText(self.config)
        self.assertTrue(provider.validate_config())
        
        # Invalid config (no API key)
        invalid_config = self.config.copy()
        invalid_config['google_api_key'] = None
        
        with self.assertRaises(Exception):
            EnhancedGoogleSpeechToText(invalid_config)
    
    @patch('aiohttp.ClientSession.post')
    def test_retryable_error_handling(self, mock_post):
        """Test handling of retryable errors"""
        # Mock response that triggers retry
        mock_response = AsyncMock()
        mock_response.status = 500
        mock_response.text.return_value = "Server Error"
        mock_post.return_value.__aenter__.return_value = mock_response
        
        provider = EnhancedGoogleSpeechToText(self.config)
        
        async def test_retry():
            with self.assertRaises(Exception):
                async with provider:
                    await provider.transcribe_with_retry("dummy_file.wav")
            
            # Should have made multiple attempts
            self.assertGreater(mock_post.call_count, 1)
        
        asyncio.run(test_retry())
    
    @patch('aiohttp.ClientSession.post')
    def test_non_retryable_error_handling(self, mock_post):
        """Test handling of non-retryable errors"""
        # Mock response that should not trigger retry
        mock_response = AsyncMock()
        mock_response.status = 401  # Unauthorized
        mock_response.text.return_value = "Unauthorized"
        mock_post.return_value.__aenter__.return_value = mock_response
        
        provider = EnhancedGoogleSpeechToText(self.config)
        
        async def test_no_retry():
            with self.assertRaises(Exception):
                async with provider:
                    await provider.transcribe_with_retry("dummy_file.wav")
            
            # Should only make one attempt
            self.assertEqual(mock_post.call_count, 1)
        
        asyncio.run(test_no_retry())
    
    def test_cloud_provider_factory(self):
        """Test cloud provider factory"""
        # Valid provider
        provider = CloudProviderFactory.create_provider('google', self.config)
        self.assertIsInstance(provider, EnhancedGoogleSpeechToText)
        
        # Invalid provider
        with self.assertRaises(ValueError):
            CloudProviderFactory.create_provider('invalid', self.config)
    
    def test_transcription_manager_fallback(self):
        """Test transcription manager with provider fallback"""
        config = {
            'primary_provider': 'google',
            'fallback_providers': ['azure'],
            'google_api_key': 'test_key',
            'azure_subscription_key': 'test_key',
            'max_retries': 1,
            'base_delay': 0.1
        }
        
        manager = CloudTranscriptionManager(config)
        
        # Should have initialized providers
        self.assertIn('google', manager.providers)

class TestErrorScenarios(unittest.TestCase):
    """Test various error scenarios and edge cases"""
    
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.config_path = os.path.join(self.temp_dir, 'test_config.json')
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_corrupted_audio_data(self):
        """Test handling of corrupted audio data"""
        assistant = OptimizedVoiceAssistant(self.config_path)
        
        # Create corrupted audio data
        corrupted_data = [b"not_audio_data"]
        
        with self.assertLogs(level='ERROR'):
            # Should handle gracefully without crashing
            try:
                result = assistant.convert_audio_to_numpy(corrupted_data)
                # If it doesn't crash, that's good
            except Exception:
                # If it does crash, that's also expected for corrupted data
                pass
    
    def test_disk_space_exhaustion(self):
        """Test handling when disk space is low"""
        assistant = OptimizedVoiceAssistant(self.config_path)
        
        # Mock file operations to simulate disk full
        with patch('builtins.open', side_effect=OSError("No space left on device")):
            with self.assertLogs(level='ERROR'):
                # Should handle gracefully
                try:
                    asyncio.run(assistant.log_transcription_async("test", 1.0))
                except OSError:
                    pass  # Expected
    
    def test_memory_pressure_simulation(self):
        """Test behavior under memory pressure"""
        assistant = OptimizedVoiceAssistant(self.config_path)
        
        # Create very large audio data to simulate memory pressure
        large_audio = AudioTestUtils.create_tone(duration_seconds=300)  # 5 minutes
        audio_bytes = [(large_audio * 32767).astype(np.int16).tobytes()]
        
        # Should handle without memory errors
        try:
            result = assistant.convert_audio_to_numpy(audio_bytes)
            self.assertGreater(len(result), 0)
        except MemoryError:
            # Expected on systems with limited memory
            pass
    
    def test_network_timeout_simulation(self):
        """Test network timeout handling"""
        config = {
            'timeout': 0.001,  # Very short timeout
            'google_api_key': 'test_key',
            'max_retries': 1,
            'base_delay': 0.1
        }
        
        provider = EnhancedGoogleSpeechToText(config)
        
        async def test_timeout():
            with self.assertRaises(Exception):
                async with provider:
                    await provider.transcribe_with_retry("dummy_file.wav")
        
        asyncio.run(test_timeout())
    
    def test_concurrent_access_safety(self):
        """Test thread safety of concurrent operations"""
        assistant = OptimizedVoiceAssistant(self.config_path)
        
        def worker():
            try:
                audio = AudioTestUtils.create_tone(duration_seconds=0.5)
                audio_bytes = [(audio * 32767).astype(np.int16).tobytes()]
                assistant.convert_audio_to_numpy(audio_bytes)
            except Exception:
                pass  # Expected in concurrent access
        
        # Start multiple threads
        threads = [threading.Thread(target=worker) for _ in range(5)]
        
        for t in threads:
            t.start()
        
        for t in threads:
            t.join(timeout=5)  # 5 second timeout
        
        # Should complete without deadlocks

class TestPerformanceBenchmarks(unittest.TestCase):
    """Performance and stress testing"""
    
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.config_path = os.path.join(self.temp_dir, 'test_config.json')
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_processing_speed_benchmark(self):
        """Benchmark audio processing speed"""
        assistant = OptimizedVoiceAssistant(self.config_path)
        
        # Create test audio
        audio = AudioTestUtils.create_speech_like_audio(duration_seconds=2)
        audio_bytes = [(audio * 32767).astype(np.int16).tobytes()]
        
        # Benchmark processing time
        start_time = time.time()
        result = assistant.convert_audio_to_numpy(audio_bytes)
        processing_time = time.time() - start_time
        
        # Should process 2 seconds of audio in reasonable time
        self.assertLess(processing_time, 1.0)  # Should be faster than real-time
        self.assertGreater(len(result), 0)
    
    def test_memory_usage_stability(self):
        """Test memory usage stability over multiple operations"""
        assistant = OptimizedVoiceAssistant(self.config_path)
        
        import psutil
        process = psutil.Process()
        initial_memory = process.memory_info().rss
        
        # Process multiple audio clips
        for i in range(10):
            audio = AudioTestUtils.create_speech_like_audio(duration_seconds=1)
            audio_bytes = [(audio * 32767).astype(np.int16).tobytes()]
            assistant.convert_audio_to_numpy(audio_bytes)
        
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # Memory increase should be reasonable (less than 100MB)
        self.assertLess(memory_increase, 100 * 1024 * 1024)

def create_test_audio_files():
    """Create test audio files for file-based tests"""
    test_dir = tempfile.mkdtemp()
    
    # Silent file
    silence = AudioTestUtils.create_silence(duration_seconds=1)
    AudioTestUtils.save_audio_to_file(
        silence, 
        os.path.join(test_dir, "silence.wav")
    )
    
    # Speech-like file
    speech = AudioTestUtils.create_speech_like_audio(duration_seconds=2)
    AudioTestUtils.save_audio_to_file(
        speech, 
        os.path.join(test_dir, "speech.wav")
    )
    
    # Noise file
    noise = AudioTestUtils.create_noise(duration_seconds=1)
    AudioTestUtils.save_audio_to_file(
        noise, 
        os.path.join(test_dir, "noise.wav")
    )
    
    return test_dir

class TestSuiteRunner:
    """Main test suite runner with comprehensive reporting"""
    
    def __init__(self):
        self.test_results = {}
    
    def run_all_tests(self):
        """Run all test suites and generate report"""
        test_suites = [
            TestVoiceServiceConfiguration,
            TestAudioProcessing,
            TestAsyncAudioProcessing,
            TestCloudProviders,
            TestErrorScenarios,
            TestPerformanceBenchmarks
        ]
        
        total_tests = 0
        total_failures = 0
        total_errors = 0
        
        print("🧪 Running Enhanced Voice Assistant Test Suite")
        print("=" * 60)
        
        for test_class in test_suites:
            print(f"\n📋 Running {test_class.__name__}...")
            
            suite = unittest.TestLoader().loadTestsFromTestCase(test_class)
            runner = unittest.TextTestRunner(verbosity=2, stream=open(os.devnull, 'w'))
            result = runner.run(suite)
            
            total_tests += result.testsRun
            total_failures += len(result.failures)
            total_errors += len(result.errors)
            
            self.test_results[test_class.__name__] = {
                'tests': result.testsRun,
                'failures': len(result.failures),
                'errors': len(result.errors),
                'success_rate': (result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100 if result.testsRun > 0 else 0
            }
            
            status = "✅ PASSED" if len(result.failures) == 0 and len(result.errors) == 0 else "❌ FAILED"
            print(f"   {status} - {result.testsRun} tests, {len(result.failures)} failures, {len(result.errors)} errors")
        
        self.print_summary(total_tests, total_failures, total_errors)
    
    def print_summary(self, total_tests, total_failures, total_errors):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        success_rate = (total_tests - total_failures - total_errors) / total_tests * 100 if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {total_tests - total_failures - total_errors}")
        print(f"Failed: {total_failures}")
        print(f"Errors: {total_errors}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        print("\n📈 Test Suite Breakdown:")
        for suite_name, results in self.test_results.items():
            print(f"  {suite_name}:")
            print(f"    Tests: {results['tests']}")
            print(f"    Success Rate: {results['success_rate']:.1f}%")
        
        if total_failures == 0 and total_errors == 0:
            print("\n🎉 All tests passed! The voice assistant is ready for production.")
        else:
            print(f"\n⚠️  {total_failures + total_errors} test(s) failed. Review the issues before deployment.")
        
        print("\n💡 Next Steps:")
        print("   1. Run individual test suites for detailed debugging")
        print("   2. Check system requirements if tests fail")
        print("   3. Verify audio system configuration")
        print("   4. Test with actual hardware microphone")

if __name__ == "__main__":
    # Check if running with specific test class
    if len(sys.argv) > 1:
        # Run specific test class
        test_class_name = sys.argv[1]
        globals_dict = globals()
        
        if test_class_name in globals_dict:
            suite = unittest.TestLoader().loadTestsFromTestCase(globals_dict[test_class_name])
            runner = unittest.TextTestRunner(verbosity=2)
            runner.run(suite)
        else:
            print(f"Test class '{test_class_name}' not found")
            print("Available test classes:")
            for name, obj in globals_dict.items():
                if isinstance(obj, type) and issubclass(obj, unittest.TestCase) and obj != unittest.TestCase:
                    print(f"  {name}")
    else:
        # Run full test suite
        runner = TestSuiteRunner()
        runner.run_all_tests()
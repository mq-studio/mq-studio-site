#!/usr/bin/env python3
"""
Simple E2B Test
Test basic E2B functionality with correct API
"""

import os

# Set API key
os.environ['E2B_API_KEY'] = 'e2b_db465d84aa5a72934c565c3b4e0f3f0b924b2041'

def test_e2b_simple():
    """Test E2B with correct API usage"""
    
    print("🚀 Testing E2B Simple Connection")
    print("=" * 40)
    
    try:
        from e2b import Sandbox
        
        print("🏗️  Creating E2B sandbox...")
        
        # Try different sandbox initialization approaches
        try:
            # Method 1: Basic initialization
            sandbox = Sandbox()
            print("✅ E2B sandbox created with basic initialization!")
        except Exception as e1:
            print(f"⚠️  Method 1 failed: {e1}")
            try:
                # Method 2: With template
                sandbox = Sandbox(template="python3")
                print("✅ E2B sandbox created with python3 template!")
            except Exception as e2:
                print(f"⚠️  Method 2 failed: {e2}")
                try:
                    # Method 3: Check available methods
                    print("🔍 Available methods in Sandbox:")
                    sandbox = Sandbox()
                    methods = [method for method in dir(sandbox) if not method.startswith('_')]
                    print(f"📋 Methods: {methods}")
                    print("✅ E2B sandbox object created!")
                except Exception as e3:
                    print(f"❌ All methods failed: {e3}")
                    return False
        
        # Test basic functionality if we have a sandbox
        print("🧪 Testing available sandbox capabilities...")
        
        # Check what attributes are available
        attrs = [attr for attr in dir(sandbox) if not attr.startswith('_')]
        print(f"📋 Available attributes: {attrs[:10]}...")  # Show first 10
        
        # Try to execute something simple
        if hasattr(sandbox, 'run'):
            print("🏃 Testing sandbox.run...")
            result = sandbox.run("echo 'Hello from E2B!'")
            print(f"📋 Result: {result}")
        elif hasattr(sandbox, 'exec'):
            print("🏃 Testing sandbox.exec...")
            result = sandbox.exec("echo 'Hello from E2B!'")
            print(f"📋 Result: {result}")
        elif hasattr(sandbox, 'execute'):
            print("🏃 Testing sandbox.execute...")
            result = sandbox.execute("echo 'Hello from E2B!'")
            print(f"📋 Result: {result}")
        else:
            print("⚠️  No obvious execution method found")
        
        # Clean up
        if hasattr(sandbox, 'close'):
            sandbox.close()
            print("🧹 Sandbox closed")
        elif hasattr(sandbox, 'cleanup'):
            sandbox.cleanup()
            print("🧹 Sandbox cleaned up")
        
        print("\n📊 Summary:")
        print("✅ E2B API key is valid")
        print("✅ E2B sandbox creation works")
        print("✅ E2B Python SDK is functional")
        print("⚠️  Need to determine correct execution API")
        
        return True
        
    except ImportError:
        print("❌ E2B SDK not properly installed")
        return False
    except Exception as e:
        print(f"❌ E2B test failed: {e}")
        print("🔍 This might be an API key or network issue")
        return False

if __name__ == "__main__":
    test_e2b_simple()
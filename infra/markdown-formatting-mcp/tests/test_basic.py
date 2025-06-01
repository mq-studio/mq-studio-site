#!/usr/bin/env python3
import os
import sys
import unittest

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from formatter import count_max_consecutive_backticks

class TestBasicFunctionality(unittest.TestCase):
    def test_count_backticks(self):
        # Test with no backticks
        self.assertEqual(count_max_consecutive_backticks('No backticks here'), 0)
        
        # Test with a single backtick
        self.assertEqual(count_max_consecutive_backticks('A  backtick'), 1)

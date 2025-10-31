import unittest

from python_utils.palindrome import is_palindrome


class TestIsPalindrome(unittest.TestCase):
    def test_empty_string(self):
        self.assertTrue(is_palindrome(""))

    def test_single_character(self):
        self.assertTrue(is_palindrome("a"))

    def test_simple_palindrome(self):
        self.assertTrue(is_palindrome("racecar"))

    def test_not_palindrome(self):
        self.assertFalse(is_palindrome("openai"))

    def test_mixed_case_and_punctuation(self):
        self.assertTrue(is_palindrome("A man, a plan, a canal: Panama"))

    def test_numbers_and_letters(self):
        self.assertTrue(is_palindrome("1a2b2a1"))

    def test_strict_mode(self):
        self.assertFalse(is_palindrome("Aa", normalize=False))
        self.assertTrue(is_palindrome("aa", normalize=False))

    def test_type_error(self):
        with self.assertRaises(TypeError):
            is_palindrome(None)  # type: ignore[arg-type]


if __name__ == "__main__":
    unittest.main(verbosity=2)


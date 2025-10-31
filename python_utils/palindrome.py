"""
Palindrome utilities.

This module provides a simple function to check whether a string is a palindrome.
"""

from __future__ import annotations


def is_palindrome(s: str, *, normalize: bool = True) -> bool:
    """Return True if the input string is a palindrome.

    Behavior:
    - When ``normalize`` is True (default), the check is case-insensitive and ignores
      non-alphanumeric characters. For example, "A man, a plan, a canal: Panama" is
      considered a palindrome.
    - When ``normalize`` is False, the function performs a strict character-by-character
      comparison (including punctuation, whitespace, and case).

    Args:
        s: Input string to check.
        normalize: If True, ignore non-alphanumeric characters and case.

    Returns:
        True if ``s`` is a palindrome under the selected mode, otherwise False.

    Raises:
        TypeError: If ``s`` is not a string.
    """

    if not isinstance(s, str):
        raise TypeError("s must be a string")

    if normalize:
        # Case-insensitive, ignore non-alphanumeric
        cleaned = "".join(ch for ch in s.casefold() if ch.isalnum())
        return cleaned == cleaned[::-1]

    # Strict, byte-wise style comparison
    return s == s[::-1]


__all__ = ["is_palindrome"]


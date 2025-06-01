import os
from PIL import Image
import pyautogui as pag
import pytesseract


def capture_active_window() -> Image.Image:
    """Return a screenshot of the active window, or full screen as fallback."""
    try:
        win = pag.getActiveWindow()
        bbox = (win.left, win.top, win.left + win.width, win.top + win.height)
        return pag.screenshot(region=bbox)
    except Exception:
        return pag.screenshot()  # fallback


def ocr_image(img: Image.Image) -> str:
    """OCR an image to plain text using Tesseract."""
    return pytesseract.image_to_string(img)


def get_context_snippet(max_chars: int = 2_000) -> str:
    """Screenshot active window → OCR → truncate to max_chars."""
    img = capture_active_window()
    text = ocr_image(img)
    return text[:max_chars]

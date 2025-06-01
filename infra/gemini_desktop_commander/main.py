import os, sys, argparse
from pathlib import Path
from dotenv import load_dotenv

import pyautogui as pag
import google.generativeai as genai

from utils import get_context_snippet


# ── 1. Load env & configure Gemini ──────────────────────────────
ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")
DRY_RUN = os.getenv("DRY_RUN", "true").lower() == "true"

if not API_KEY:
    sys.exit("✖︎  GEMINI_API_KEY missing – set it in .env")

genai.configure(api_key=API_KEY)


# ── 2. Desktop‑control tools (function‑callable) ────────────────
@genai.tools.fn
def click(x: int, y: int, clicks: int = 1, interval: float = 0.0,
          button: str = "left") -> str:
    """Click at (x, y) on the screen."""
    if DRY_RUN:
        print(f"[dry‑run] click({x}, {y})")
        return "DRY_RUN"
    pag.click(x, y, clicks=clicks, interval=interval, button=button)
    return "OK"


@genai.tools.fn
def type_text(text: str, interval: float = 0.02) -> str:
    """Type text via the keyboard."""
    if DRY_RUN:
        print(f"[dry‑run] type_text({text!r})")
        return "DRY_RUN"
    pag.write(text, interval=interval)
    return "OK"


@genai.tools.fn
def press_hotkey(*keys: str) -> str:
    """Press a combination such as ('ctrl', 's')."""
    if DRY_RUN:
        print(f"[dry‑run] press_hotkey{keys}")
        return "DRY_RUN"
    pag.hotkey(*keys)
    return "OK"


# ── 3. Model and system prompt ──────────────────────────────────
SYSTEM_PROMPT = """
You are Desktop‑Commander‑Gemini – an agent that automates the user's computer.
Think step‑by‑step and decide whether to call click(), type_text(), or press_hotkey().
After every 3–4 tool calls, if you need updated screen context, reply with exactly:
SHOW_CONTEXT
Never perform destructive actions (delete, shutdown, etc.).
"""

model = genai.GenerativeModel(
    "gemini-1.5-pro",
    tools=[click, type_text, press_hotkey],
)


# ── 4. Chat loop ────────────────────────────────────────────────
def chat(user_request: str):
    history = [
        {"role": "system", "parts": [SYSTEM_PROMPT]},
        {"role": "user",   "parts": [user_request]},
    ]

    while True:
        result = model.generate_content(history)
        message = result.candidates[0].content
        history.append(message)

        # Function calls already executed (or dry‑run) by SDK.

        # Check for assistant text or context refresh request
        text_parts = [p.text for p in message.parts if hasattr(p, "text")]
        if text_parts:
            response_text = "\n".join(text_parts).strip()
            if response_text.upper().startswith("SHOW_CONTEXT"):
                context = get_context_snippet()
                history.append({"role": "user", "parts": [f"SCREEN_CONTEXT:\n{context}"]})
                continue

            print(f"\nAssistant:\n{response_text}")
            break  # finished conversation


# ── 5. CLI entry point ──────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gemini Desktop Commander")
    parser.add_argument("prompt", nargs="+", help="What should the agent do?")
    args = parser.parse_args()
    user_prompt = " ".join(args.prompt)
    chat(user_prompt)

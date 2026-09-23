"""
Run this once to see exactly which models YOUR Hugging Face account and
token can currently use for chat — instead of guessing model names one
at a time. Model availability on the router changes over time, so this
is the reliable way to pick one.

Run:
    python -m chatbot.list_available_models
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.environ.get("HF_API_TOKEN")
if not token:
    raise SystemExit("HF_API_TOKEN not set — check your .env file.")

resp = requests.get(
    "https://router.huggingface.co/v1/models",
    headers={"Authorization": f"Bearer {token}"},
    timeout=30,
)
resp.raise_for_status()
models = resp.json().get("data", [])

print(f"Found {len(models)} models your account can currently use.\n")
print("A good pick is usually a small, well-known instruct model. Look for:")
print("  - Qwen/Qwen2.5-*-Instruct")
print("  - meta-llama/Llama-3.1-8B-Instruct or Llama-3.3-70B-Instruct")
print("  - microsoft/Phi-3.5-mini-instruct")
print()
print("First 40 model ids returned for your account:\n")
for m in models[:40]:
    print(" -", m.get("id"))
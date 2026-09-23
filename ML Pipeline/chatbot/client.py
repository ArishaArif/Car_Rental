"""
PredictDrive — Chatbot Client
=================================
Calls Hugging Face's Inference Providers router with strict guardrails
and few-shot examples for domain enforcement.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

from .config import (
    MODEL_ID,
    HF_API_URL,
    SYSTEM_PROMPT,
    FEW_SHOT_EXAMPLES,
    BLOCK_PATTERNS,
    MAX_NEW_TOKENS,
    REQUEST_TIMEOUT_SECONDS,
    TEMPERATURE,
)


class ChatbotError(Exception):
    pass


def _looks_off_topic_or_injection(message: str) -> bool:
    text = message.lower()
    return any(pattern in text for pattern in BLOCK_PATTERNS)


class Chatbot:
    def __init__(self, hf_token: str | None = None):
        self.token = hf_token or os.environ.get("HF_API_TOKEN")
        if not self.token:
            raise ChatbotError(
                "No Hugging Face token found. Set HF_API_TOKEN in your .env file "
                "or pass it directly to Chatbot()."
            )
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def ask(self, user_message: str) -> str:
        if not user_message or not user_message.strip():
            return "Please type a question about bookings, vehicles, or pricing."

        # First guardrail layer: cheap keyword pre-filter for obvious injection attempts
        if _looks_off_topic_or_injection(user_message):
            return (
                "I'm the PredictDrive assistant, and I can only help with questions "
                "about our car rental service — vehicles, bookings, pricing, or policies. "
                "I'm not able to help with anything outside of that."
            )

        # Build messages array including system prompt + few-shot training examples
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        messages.extend(FEW_SHOT_EXAMPLES)
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": MODEL_ID,
            "messages": messages,
            "max_tokens": MAX_NEW_TOKENS,
            "temperature": TEMPERATURE,
        }

        try:
            response = requests.post(
                HF_API_URL,
                headers=self.headers,
                json=payload,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
        except requests.exceptions.RequestException as e:
            raise ChatbotError(f"Could not reach Hugging Face API: {e}")

        if response.status_code == 503:
            raise ChatbotError(
                "The chatbot model is starting up — please try again in ~20 seconds."
            )
        if response.status_code == 401:
            raise ChatbotError(
                "Hugging Face token rejected — check HF_API_TOKEN in .env."
            )
        if response.status_code == 402:
            raise ChatbotError(
                "Hugging Face reports no inference credits available."
            )
        if response.status_code == 400 and "model_not_supported" in response.text:
            raise ChatbotError(
                "This model isn't available through any enabled inference provider on your HF account."
            )
        if response.status_code != 200:
            raise ChatbotError(f"Hugging Face API error {response.status_code}: {response.text}")

        data = response.json()
        try:
            return data["choices"][0]["message"]["content"].strip()
        except (KeyError, IndexError, TypeError):
            raise ChatbotError(f"Unexpected response shape from API: {data}")


if __name__ == "__main__":
    bot = Chatbot()
    print("Testing off-topic enforcement...")
    print(bot.ask("What's the capital of France?"))
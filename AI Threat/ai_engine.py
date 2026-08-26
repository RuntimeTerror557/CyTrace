import os
from google import genai
from pydantic import BaseModel, Field

# Ensure GEMINI_API_KEY is set in environment or passed directly
# Use the API key found in test_ai.py if none provided in env, although relying on env is better.
# For now, let's just initialize the client as specified.
client = genai.Client()

class ThreatAnalysis(BaseModel):
    status: str = Field(description="Strictly output 'Safe' or 'Unsafe'")
    threat_score: int = Field(description="Precise score from 0 to 100")
    classification: str = Field(description="Safe, Spam, Phishing, Spoofing, Malware, BEC, Credential Theft")
    severity: str = Field(description="Safe, Low, Medium, High, Critical")
    reasons: list[str] = Field(description="Ranked plain-language explainability bullet points")

import time
from google.genai import errors

def analyze_email_threat(email_text: str) -> dict:
    """
    Module 4 Engine: Analyzes raw email text and produces a structured threat score.
    Includes basic retry logic for handling API rate limits or 503 errors.
    """
    max_retries = 3
    
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=email_text,
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': ThreatAnalysis,
                    'system_instruction': (
                        "You are an expert SOC analyst evaluating raw email text for "
                        "phishing, BEC, spoofing, and fraud. Output only structured data."
                    )
                },
            )
            return response.parsed.model_dump()
            
        except (errors.APIError, Exception) as e:
            if attempt < max_retries - 1:
                print(f"[Warning] API Error: {str(e)}. Retrying in 2 seconds (Attempt {attempt+1}/{max_retries})...")
                time.sleep(2)
            else:
                print(f"[Error] Failed to analyze email after {max_retries} attempts.")
                raise e

import sys
import json

if __name__ == "__main__":
    # Read email text from standard input
    email_text = sys.stdin.read()
    if not email_text.strip():
        print(json.dumps({"error": "No email text provided via STDIN"}))
        sys.exit(1)
        
    try:
        threat_verdict = analyze_email_threat(email_text)
        print(json.dumps(threat_verdict))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

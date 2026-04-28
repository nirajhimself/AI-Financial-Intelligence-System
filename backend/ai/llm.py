import requests

OLLAMA_URL = "http://localhost:11434/api/generate"

def chat_with_ai(prompt: str):
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": "llama3",   # or mistral
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        data = response.json()
        return data.get("response", "No response")

    except Exception as e:
        return f"AI Error: {str(e)}"
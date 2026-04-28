import ollama
from .prediction_service import hybrid_prediction

def generate_chat_response(message, symbol):

    prediction = hybrid_prediction(symbol)

    prompt = f"""
    You are a financial AI.

    Stock: {symbol}
    Current Price: {prediction['current_price']}
    Prediction: {prediction['final_prediction']}
    Signal: {prediction['indicator_signal']}
    Risk: {prediction['accuracy']}
    Sentiment: {prediction['sentiment_label']}

    User question: {message}

    Give a short, smart answer.
    """

    response = ollama.chat(model="phi3", messages=[
        {"role": "user", "content": prompt}
    ])

    return response["message"]["content"]
def recommendation(current_price, predicted_price):
    if predicted_price > current_price * 1.05:
        return "BUY"
    elif predicted_price < current_price * 0.95:
        return "SELL"
    return "HOLD"
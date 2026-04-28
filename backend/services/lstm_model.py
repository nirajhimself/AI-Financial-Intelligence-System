import numpy as np
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

def train_lstm_model(symbol):
    df = yf.Ticker(symbol).history(period="1y")

    if df.empty:
        return None, None

    data = df["Close"].values.reshape(-1, 1)

    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(data)

    X, y = [], []

    for i in range(60, len(scaled_data)):
        X.append(scaled_data[i-60:i])
        y.append(scaled_data[i])

    X, y = np.array(X), np.array(y)

    model = Sequential()
    model.add(LSTM(50, return_sequences=True, input_shape=(X.shape[1], 1)))
    model.add(LSTM(50))
    model.add(Dense(1))

    model.compile(optimizer='adam', loss='mean_squared_error')
    model.fit(X, y, epochs=3, batch_size=32, verbose=0)

    return model, scaler


def predict_next_price(symbol):
    model, scaler = train_lstm_model(symbol)

    if model is None:
        return None

    df = yf.Ticker(symbol).history(period="1y")
    data = df["Close"].values.reshape(-1, 1)

    last_60 = data[-60:]

    scaled = scaler.transform(last_60)

    X_test = np.array([scaled])
    pred = model.predict(X_test, verbose=0)

    predicted_price = scaler.inverse_transform(pred)[0][0]

    current_price = data[-1][0]

    expected_return = (predicted_price - current_price) / current_price

    return float(expected_return)
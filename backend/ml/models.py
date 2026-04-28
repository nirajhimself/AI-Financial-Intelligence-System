import numpy as np
import joblib
import os
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from xgboost import XGBRegressor

from ml.features import create_features


# -------------------------------
# SAVE MODEL
# -------------------------------
def save_model(model, name="model.pkl"):

    # 🔥 ensure models folder exists
    os.makedirs("models", exist_ok=True)

    path = os.path.join("models", name)

    joblib.dump(model, path)

    print(f"✅ Model saved at: {path}")


# -------------------------------
# LOAD MODEL
# -------------------------------
def load_model(name="model.pkl"):
    return joblib.load(name)


# -------------------------------
# CALCULATE ACCURACY (OPTIONAL)
# -------------------------------
def calculate_accuracy(y_test, y_pred):
    y_test = np.array(y_test).flatten()
    y_pred = np.array(y_pred).flatten()

    error = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
    return round(100 - error, 2)


# -------------------------------
# TRAIN MODELS
# -------------------------------
def train_models(df):

    # 🔥 Create features
    df = create_features(df)

    # 🔥 IMPORTANT: remove NaN rows
    df = df.dropna()

    # -------------------
    # Features
    # -------------------
    X = df[["MA10", "MA20", "MA50", "Daily_Return"]]
    y = df["Close"].values.ravel()

    split = int(len(df) * 0.8)

    X_train = X[:split]
    X_test = X[split:]

    y_train = y[:split]
    y_test = y[split:]

    # -------------------
    # Linear Regression
    # -------------------
    lr = LinearRegression()
    lr.fit(X_train, y_train)

    lr_pred = lr.predict(X_test)
    lr_rmse = np.sqrt(mean_squared_error(y_test, lr_pred))

    # -------------------
    # Random Forest
    # -------------------
    rf = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        random_state=42
    )
    rf.fit(X_train, y_train)

    rf_pred = rf.predict(X_test)
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_pred))

    # -------------------
    # XGBoost
    # -------------------
    xgb = XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6
    )
    xgb.fit(X_train, y_train)

    xgb_pred = xgb.predict(X_test)
    xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_pred))

    # -------------------
    # Select Best Model
    # -------------------
    models = {
        "LinearRegression": (lr, lr_rmse),
        "RandomForest": (rf, rf_rmse),
        "XGBoost": (xgb, xgb_rmse)
    }

    best_model_name = min(models, key=lambda k: models[k][1])
    best_model = models[best_model_name][0]

    # -------------------
    # Accuracy (optional)
    # -------------------
    best_pred = models[best_model_name][0].predict(X_test)
    accuracy = calculate_accuracy(y_test, best_pred)

    # -------------------
    # Predict latest
    # -------------------
    latest_features = X.tail(1).values
    predicted_price = best_model.predict(latest_features)[0]

    # -------------------
    # Save model
    # -------------------
    # save all models
    save_model(lr, "linear.pkl")
    save_model(rf, "random_forest.pkl")
    save_model(xgb, "xgboost.pkl")

    # also save best
    save_model(best_model, "best_model.pkl")

    return best_model, best_model_name, predicted_price, accuracy
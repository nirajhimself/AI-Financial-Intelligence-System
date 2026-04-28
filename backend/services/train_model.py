import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score

# 🔥 Better model
from xgboost import XGBRegressor


# -------------------------
# LOAD DATASET
# -------------------------
df = pd.read_csv("stock_dataset.csv")

print("Dataset shape:", df.shape)


# -------------------------
# FEATURES (UPDATED)
# -------------------------
X = df[[
    "RSI",
    "MACD",
    "Return",
    "Volatility",
    "SMA_20",
    "SMA_50",
    "Momentum",
    "Volume_Change"
]]

y = df["Target"]


# -------------------------
# TRAIN TEST SPLIT
# -------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)


# -------------------------
# SCALING (IMPORTANT)
# -------------------------
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


# -------------------------
# MODEL (UPGRADED)
# -------------------------
model = XGBRegressor(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=5,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

model.fit(X_train_scaled, y_train)


# -------------------------
# EVALUATION
# -------------------------
y_pred = model.predict(X_test_scaled)

score = r2_score(y_test, y_pred)
print("Model R2 Score:", round(score, 4))


# -------------------------
# SAVE MODEL + SCALER
# -------------------------
joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("✅ Model and scaler saved!")
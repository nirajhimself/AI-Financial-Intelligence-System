# Gnosis — AI Financial Intelligence System

An AI-powered stock market intelligence platform that combines machine learning, technical indicators, and sentiment analysis to deliver smart stock predictions and investment recommendations.

---

# Overview

_Gnosis_ helps users make better investment decisions using:

- Real-time market data
- Machine Learning predictions
- Technical indicators (RSI, MACD, SMA, etc.)
- Sentiment analysis
- AI-based portfolio recommendations

---

# Tech Stack

# Backend

- FastAPI (Python)
- scikit-learn, XGBoost
- yfinance (market data)
- Pandas, NumPy

# Frontend

- Next.js 14
- TypeScript
- TailwindCSS
- Chart.js

---

# Features

# AI Stock Prediction

- Predicts future price using:
  - Linear Regression
  - Random Forest
  - XGBoost

- Hybrid prediction engine (ML + Rule-based + Sentiment)
- Outputs:
  - Predicted price
  - Confidence score
  - BUY / SELL / HOLD signal

---

# AI Stock Recommendation System

- Suggests best stocks to invest in
- Portfolio allocation based on:
  - Risk (volatility)
  - Return estimation
  - Technical indicators (RSI, MACD)
  - ML-based expected return

- Shows:
  - Investment split
  - Expected return %
  - Future portfolio value

---

# Technical Analysis

- RSI, MACD, Moving Averages
- Indicator-based trading signals
- Trend detection

---

# Interactive Charts

- Real-time price visualization
- Clean trading-style UI
- Historical data insights

---

# Smart Features

- Sentiment analysis integration
- Dark / Light mode UI
- Real-time ticker tape
- Clean and responsive dashboard

---

# Project Structure

```
backend/
├── routes/
├── services/
├── ml/
├── utils/

frontend/
├── app/
├── components/
├── services/
├── types/
```

---

# Setup Instructions

# 🔹 Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

# Frontend

```bash
cd frontend
npm install
npm run dev

# Future Improvements

* Real-time WebSocket price updates
* Advanced portfolio optimization
* LSTM / Deep Learning models
* News-based sentiment engine
* Cloud deployment (Vercel + Render)

# Project Goal

To build a **production-ready AI financial assistant** that bridges the gap between data science and real-world investing.
```

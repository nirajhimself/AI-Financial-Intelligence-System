from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 🔥 Import routers (clean way)
from routes.predict import router as predict_router
from routes.chat import router as chat_router
from routes.finance import router as finance_router
from routes.recommendation import router as recommendation_router
from routes.ai import router as ai_router
from routes.history import router as history_router
load_dotenv()

app = FastAPI(
    title="Gnosis AI Financial Intelligence System",
    version="1.0.0",
    description="AI-powered stock prediction, recommendation, and advisory system"
)

# 🔥 CORS (keep open for dev, restrict in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# ✅ CLEAN ROUTE REGISTRATION
# ================================

# Core APIs
app.include_router(predict_router)
app.include_router(chat_router)

# Market data
app.include_router(finance_router)
app.include_router(history_router)

# AI features
app.include_router(recommendation_router)
app.include_router(ai_router)

# ================================
# ✅ HEALTH CHECK
# ================================
@app.get("/")
def home():
    return {
        "status": "running",
        "system": "Gnosis AI",
        "version": "1.0.0"
    }

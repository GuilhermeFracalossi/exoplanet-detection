from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router as api_router

app = FastAPI(
    title="Exoplanet AI API",
    version="1.0.0",
    description="API for classifying exoplanets using NASA open datasets and ML models"
)
# Permitir requisições do frontend
origins = [
    "*",  # endereço do seu frontend
    # você pode adicionar "*" para liberar todas as origens (não recomendado em produção)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # permite todos os headers
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to Exoplanet AI API"}

"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routers import health, chains, tokens

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(chains.router, prefix="/api", tags=["chains"])
app.include_router(tokens.router, prefix="/api", tags=["tokens"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Superchain Token Explorer API",
        "version": settings.app_version,
    }

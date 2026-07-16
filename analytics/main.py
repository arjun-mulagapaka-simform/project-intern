from fastapi import FastAPI
from .routers import leaderboard

app = FastAPI(
    title="Proof Analytics API",
    description="Read-only microservice for habit tracking streaks and leaderboard analytics",
    version="1.0.0"
)

# Attach routers under the /api namespace
app.include_router(leaderboard.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "analytics"}

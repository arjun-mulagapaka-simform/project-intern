from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas.leaderboard import LeaderboardItem

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("/", response_model=List[LeaderboardItem])
def get_leaderboard(db: Session = Depends(get_db)):
    """Exposes habits consistency leaderboard sorted by streak duration."""
    # Placeholder skeletal response matching simple items
    return [
        LeaderboardItem(rank=1, email="alice@example.com", current_streak=15, longest_streak=20),
        LeaderboardItem(rank=2, email="bob@example.com", current_streak=10, longest_streak=12)
    ]

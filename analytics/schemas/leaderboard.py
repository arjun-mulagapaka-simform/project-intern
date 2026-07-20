from pydantic import BaseModel

class LeaderboardItem(BaseModel):
    """Pydantic model representing habit consistency rankings."""
    rank: int
    email: str
    current_streak: int
    longest_streak: int

    class Config:
        from_attributes = True

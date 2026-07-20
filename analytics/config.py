import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    DB_NAME: str = os.getenv("DB_NAME", "")
    DB_USER: str = os.getenv("DB_USER", "")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    
    @property
    def DATABASE_URL(self) -> str:
        if not self.DB_NAME:
            # Fallback to the same SQLite database as Django for local dev if Postgres is not configured
            return "sqlite:///../backend/db.sqlite3"
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()

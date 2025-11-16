import os
from typing import ClassVar
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OLLAMA_URL: str = "http://localhost:11434/api/chat"
    MODEL_NAME: str = "gemma3:4b"
    BILINGUAL_VERBS_PATH: ClassVar[str] = os.path.join(
        os.path.dirname(__file__), "bilingual_action_verbs.json"
    )
    class Config:
        env_file = ".env"

settings = Settings()

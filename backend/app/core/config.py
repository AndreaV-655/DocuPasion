from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    APP_NAME: str = "DocuPasion API"
    VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite:///./docupasion.db"
    UPLOAD_DIR: str = "uploads"
    FRONTEND_DIR: str = "../frontend"

    # CORS: orígenes permitidos separados por coma ("" = solo mismo origen)
    CORS_ORIGINS: str = ""

    # Seguridad
    SECRET_KEY: str = "cambiar-esta-clave-en-produccion"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 horas

    # IA (no publicar en Git)
    OPENAI_API_KEY: str | None = None
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    LLM_MODEL: str = "gpt-4o-mini"
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 64

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
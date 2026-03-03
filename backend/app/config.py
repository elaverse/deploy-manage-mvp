from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "ap-northeast-2"
    s3_backup_bucket: str = "deployment-backup"

    json_api_base_url: str = "https://dev.e-cloud.ai:8443"
    json_api_token: str = ""
    json_api_delete_enabled: bool = True

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()

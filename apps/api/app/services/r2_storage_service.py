from __future__ import annotations

from functools import cached_property

from app.config import Settings, get_settings


class StorageConfigurationError(Exception):
    """Raised when R2 storage is not configured."""


class R2StorageService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def _validate_settings(self) -> None:
        required_values = {
            "R2_ACCESS_KEY_ID": self.settings.r2_access_key_id,
            "R2_SECRET_ACCESS_KEY": self.settings.r2_secret_access_key,
            "R2_BUCKET_NAME": self.settings.r2_bucket_name,
            "R2_ENDPOINT_URL": self.settings.r2_endpoint_url,
        }
        missing = [name for name, value in required_values.items() if not value]
        if missing:
            raise StorageConfigurationError(
                f"R2 configuration is incomplete: {', '.join(missing)}"
            )

    @cached_property
    def client(self):
        self._validate_settings()
        import boto3

        return boto3.client(
            "s3",
            endpoint_url=self.settings.r2_endpoint_url,
            aws_access_key_id=self.settings.r2_access_key_id,
            aws_secret_access_key=self.settings.r2_secret_access_key,
            region_name="auto",
        )

    def generate_presigned_upload_url(
        self,
        object_key: str,
        content_type: str,
        expires_in: int,
    ) -> str:
        return self.client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self.settings.r2_bucket_name,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=expires_in,
        )

    def delete_object(self, object_key: str) -> None:
        self.client.delete_object(
            Bucket=self.settings.r2_bucket_name,
            Key=object_key,
        )


def get_r2_storage_service() -> R2StorageService:
    return R2StorageService(get_settings())

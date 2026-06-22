from __future__ import annotations

from functools import cached_property
from uuid import UUID

from app.config import Settings, get_settings


class AnalysisQueueError(Exception):
    """Raised when an analysis job cannot be enqueued."""


class AnalysisQueueService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @cached_property
    def redis_connection(self):
        from redis import Redis

        return Redis.from_url(self.settings.redis_url)

    @cached_property
    def queue(self):
        from rq import Queue

        return Queue(
            self.settings.analysis_queue_name,
            connection=self.redis_connection,
            default_timeout=self.settings.analysis_job_timeout_seconds,
        )

    def enqueue_full_analysis(self, analysis_id: UUID, retry_count: int) -> str:
        try:
            job = self.queue.enqueue(
                "app.workers.tasks.run_full_analysis_task",
                str(analysis_id),
                job_id=f"analysis-{analysis_id}-attempt-{retry_count}",
                job_timeout=self.settings.analysis_job_timeout_seconds,
                result_ttl=3600,
                failure_ttl=86400,
            )
        except Exception as exc:
            raise AnalysisQueueError(
                "Analisis belum dapat dimasukkan ke antrean Redis."
            ) from exc

        return str(job.id)


def get_analysis_queue_service() -> AnalysisQueueService:
    return AnalysisQueueService(get_settings())

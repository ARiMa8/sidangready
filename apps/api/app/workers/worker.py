from __future__ import annotations

from app.config import get_settings


def main() -> None:
    from redis import Redis
    from rq import Queue, Worker

    settings = get_settings()
    redis_connection = Redis.from_url(settings.redis_url)
    queue = Queue(settings.analysis_queue_name, connection=redis_connection)
    worker = Worker([queue], connection=redis_connection)
    worker.work()


if __name__ == "__main__":
    main()

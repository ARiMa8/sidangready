# SidangReady AI API

FastAPI backend foundation for SidangReady AI.

Current scope: Phase 2 only.

Implemented:

- FastAPI app factory
- `/api/health`
- JWT-based auth foundation
- User registration, login, and current-user endpoint
- Authenticated project CRUD
- SQLAlchemy models
- Alembic migration setup
- PostgreSQL and Redis Docker Compose services

Not implemented yet:

- Cloudflare R2 upload flow
- Document parsing
- Redis worker tasks
- Gemini analysis
- Report export generation

## Local Commands

Compile backend source:

```bash
python -m compileall app
```

Run tests:

```bash
python -m unittest discover -s tests
```

Run locally after dependencies are installed:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Run migrations:

```bash
alembic upgrade head
```

# SidangReady AI API

FastAPI backend for SidangReady AI.

Current scope: Phase 5 complete.

Implemented:

- FastAPI app factory
- `/api/health`
- JWT-based auth foundation
- User registration, login, and current-user endpoint
- Authenticated project CRUD
- Cloudflare R2 presigned upload support
- Document upload confirmation
- Project-owned document listing
- Document deletion with R2 delete attempt
- File upload validation and project upload quota checks
- Document parsing for PDF, DOCX, PPTX, and TXT
- Document extraction endpoint
- Redis-backed RQ analysis queue
- Full analysis placeholder task
- Progress polling endpoints
- Retry-once behavior for failed analyses
- Worker service entrypoint
- SQLAlchemy models
- Alembic migration setup
- PostgreSQL, Redis, API, and worker Docker Compose services
- Configurable Docker host ports via `POSTGRES_PORT` and `REDIS_PORT`

Not implemented yet:

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

Run the worker locally:

```bash
python -m app.workers.worker
```

Run locally after dependencies are installed:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Run migrations:

```bash
alembic upgrade head
```

## Document Upload Flow

```text
POST /api/projects/{project_id}/documents/presign
POST /api/projects/{project_id}/documents/confirm
GET /api/projects/{project_id}/documents
POST /api/projects/{project_id}/documents/{document_id}/extract
DELETE /api/projects/{project_id}/documents/{document_id}
```

The frontend should upload directly to the presigned R2 URL returned by the backend, then call `confirm` so the backend can persist document metadata.

Required local environment variables:

```text
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT_URL=
R2_PUBLIC_BASE_URL=
```

Never commit real R2 credentials.

## Analysis Queue Flow

```text
POST /api/projects/{project_id}/analyses/full
GET /api/projects/{project_id}/analyses/latest
GET /api/projects/{project_id}/analyses/{analysis_id}
POST /api/projects/{project_id}/analyses/{analysis_id}/retry
```

Phase 5 only queues and runs a placeholder full-analysis task. Real Gemini
analysis starts in Phase 6.

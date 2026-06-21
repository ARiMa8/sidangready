# SidangReady AI API

FastAPI backend foundation for SidangReady AI.

Current scope: Phase 2 only.

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
- SQLAlchemy models
- Alembic migration setup
- PostgreSQL and Redis Docker Compose services

Not implemented yet:

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

## Document Upload Flow

```text
POST /api/projects/{project_id}/documents/presign
POST /api/projects/{project_id}/documents/confirm
GET /api/projects/{project_id}/documents
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

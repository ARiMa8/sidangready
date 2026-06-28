# SidangReady AI API

FastAPI backend for SidangReady AI.

Current scope: Phase 7 complete.

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
- Full Gemini-backed analysis task
- Progress polling endpoints
- Retry-once behavior for failed analyses
- Worker service entrypoint
- Gemini REST integration
- Prompt templates for extraction and analysis
- Pydantic validation for structured AI output
- Deterministic readiness score calculation
- AI result persistence in `analyses.result_json`
- Result endpoints for frontend consumption
- Checklist status update endpoint
- SQLAlchemy models
- Alembic migration setup
- PostgreSQL, Redis, API, and worker Docker Compose services
- Configurable Docker host ports via `POSTGRES_PORT` and `REDIS_PORT`

Not implemented yet:

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

## Gemini Analysis Flow

```text
POST /api/projects/{project_id}/analyses/full
GET /api/projects/{project_id}/analyses/latest
GET /api/projects/{project_id}/analyses/{analysis_id}
POST /api/projects/{project_id}/analyses/{analysis_id}/retry
```

The worker reads extracted thesis, slide, and revision-note text from the
database, calls Gemini for structured analysis, validates the result with
Pydantic schemas, calculates the readiness score in backend code, and stores
the final result in `analyses.result_json`.

Required local environment variables:

```text
GEMINI_API_KEY=
GEMINI_CHEAP_MODEL=gemini-2.5-flash-lite
GEMINI_ANALYSIS_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_SECONDS=120
GEMINI_MAX_THESIS_CHARS=18000
GEMINI_MAX_SLIDE_CHARS=12000
GEMINI_MAX_REVISION_CHARS=6000
```

Never expose Gemini credentials to the frontend.

## Result Flow

```text
GET /api/projects/{project_id}/results/overview
GET /api/projects/{project_id}/results/revision-checklist
PATCH /api/projects/{project_id}/results/revision-checklist/{item_id}
GET /api/projects/{project_id}/results/checklist
PATCH /api/projects/{project_id}/results/checklist/{item_id}
GET /api/projects/{project_id}/results/slide-consistency
GET /api/projects/{project_id}/results/problematic-claims
GET /api/projects/{project_id}/results/defense-questions
GET /api/projects/{project_id}/results/presentation-script
```

`revision-checklist` contains official revision-note items derived only from
user-provided revision notes. `checklist` contains AI findings and improvement
actions from the readiness analysis. These endpoints read the latest persisted
analysis result. File export generation is intentionally reserved for Phase 8.

## Analysis Queue Flow

```text
POST /api/projects/{project_id}/analyses/full
GET /api/projects/{project_id}/analyses/latest
GET /api/projects/{project_id}/analyses/{analysis_id}
POST /api/projects/{project_id}/analyses/{analysis_id}/retry
```

Phase 6 queues and runs the real Gemini-backed full readiness analysis task.
Phase 7 exposes the persisted result to the frontend.

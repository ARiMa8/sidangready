# SidangReady AI

SidangReady AI is an AI-powered thesis defense and revision workflow assistant for Indonesian final-year students.

The product helps students review thesis documents they already own, prepare for thesis defense, organize post-defense revisions, and compare defense slides against the written report.

> SidangReady AI is not a thesis-writing service and does not replace student responsibility, supervisor feedback, or academic review.

## Overview

Indonesian final-year students often prepare for thesis defense with scattered files: a thesis report, slide deck, revision notes, examiner feedback, and personal presentation notes. SidangReady AI is designed to turn those materials into a structured preparation workflow.

Core workflow:

```text
Upload thesis report + upload defense slides + add revision notes
-> Analyze defense readiness
-> Review revision checklist, slide consistency, risky claims, examiner questions, and presentation script
-> Export a final readiness report
```

Current implementation status:

```text
Phase 6: Gemini analysis pipeline complete
```

The repository now contains a static frontend UI, FastAPI backend, Cloudflare R2 document upload flow, document parsing, Redis-backed worker queue, and Gemini-powered structured analysis. Frontend API integration and real report export are planned for later phases.

## Features

Implemented in the current static UI:

- Landing page with product positioning and ethical disclaimer
- Login and register pages as UI placeholders
- Project dashboard with mock project cards
- Create project and document upload interface
- Analysis progress page with stepper states
- Readiness overview with score summary
- Revision checklist grouped by priority
- Slide consistency table
- Problematic claim cards
- Examiner question cards
- Presentation script panel
- Export report page with Markdown as the MVP priority

Implemented in the current backend foundation:

- FastAPI application structure
- `/api/health`
- User registration and login
- JWT bearer authentication
- `GET /api/auth/me`
- Authenticated project CRUD
- SQLAlchemy models for users, projects, documents, and analyses
- Alembic migration setup
- Docker Compose services for API, PostgreSQL, and Redis
- Backend smoke tests
- Cloudflare R2 configuration
- Presigned document upload endpoint
- Upload confirmation endpoint
- Project-owned document list endpoint
- Document delete endpoint with R2 object deletion attempt
- File type, MIME type, file size, and total project upload validation
- Document parsing for PDF, DOCX, PPTX, and TXT
- Redis-backed RQ analysis queue
- Worker service for asynchronous analysis
- Gemini structured analysis pipeline
- Deterministic readiness score calculation
- AI result persistence in `analyses.result_json`

Planned for the full MVP:

- Frontend integration with real backend data
- Markdown report export
- File retention and beta quota controls

## Ethical Scope

SidangReady AI is built as a review and preparation assistant. It must not be used to bypass academic responsibility.

The application should:

- Help students understand and revise their own work
- Highlight inconsistencies between thesis reports and defense slides
- Suggest revision actions based on uploaded documents
- Prepare students for possible examiner questions
- Clearly state when evidence is not found

The application must not:

- Write a thesis from zero
- Generate fake research data
- Generate fake citations or references
- Invent test results, metrics, or methodology
- Promise that a student will pass or be approved
- Market itself as an academic cheating tool

## Tech Stack

Current frontend:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible component structure
- Lucide React icons
- Inter font
- Static mock data

Current backend:

- FastAPI
- Python 3.12 target runtime
- PostgreSQL
- Redis
- SQLAlchemy and Alembic
- Cloudflare R2 via S3-compatible API
- Google Gemini API
- RQ worker queue
- Docker Compose for VPS deployment

Planned integrations:

- Frontend API integration
- Markdown export generation

## Repository Structure

```text
sidangready/
  apps/
    web/
      app/
      components/
      hooks/
      lib/
      public/
      types/
      package.json
    api/
      app/
      alembic/
      tests/
      Dockerfile
      requirements.txt
      README.md
  .env.example
  .gitignore
  docker-compose.yml
  package.json
  package-lock.json
  README.md
```

`apps/api` contains the FastAPI backend, storage integration, document parsing, queue worker, and Gemini analysis orchestration. `apps/web` is still static/mock-data UI until Phase 7 frontend API integration.

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Installation

Clone the repository:

```bash
git clone https://github.com/your-username/sidangready-ai.git
cd sidangready-ai
```

Install dependencies:

```bash
npm install
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```bash
npm.cmd install
```

### Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Important variables are documented in `.env.example`, including:

- `NEXT_PUBLIC_API_BASE_URL`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `R2_*`
- `GEMINI_API_KEY`

Do not commit real `.env` files or secrets.

## Available Scripts

Run from the repository root:

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run lint
```

Runs ESLint for the frontend workspace.

```bash
npm run build
```

Builds the frontend for production.

You can also run the same commands inside `apps/web`.

Backend checks:

```bash
npm run api:compile
npm run api:test
npm run api:migration:sql
```

Docker Compose config:

```bash
docker compose config
```

Run the backend stack locally:

```bash
docker compose up --build
```

## Local Development

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful pages:

```text
/
/login
/register
/dashboard
/projects/new
/projects/demo/progress
/projects/demo/overview
/projects/demo/checklist
/projects/demo/consistency
/projects/demo/claims
/projects/demo/questions
/projects/demo/script
/projects/demo/export
```

## Quality Checks

Before opening a pull request or deploying, run:

```bash
npm run lint
npm run build
```

For the backend:

```bash
npm run api:compile
npm run api:test
npm run api:migration:sql
```

Run all frontend and backend checks from the repository root:

```bash
npm run check
```

Current expected result:

```text
lint: pass
build: pass
backend compile: pass
backend tests: pass
alembic offline SQL: pass
```

## Document Upload API Flow

Phase 3 adds the backend API contract for direct-to-R2 uploads:

```text
POST /api/projects/{project_id}/documents/presign
-> frontend uploads file directly to R2 with returned PUT URL
POST /api/projects/{project_id}/documents/confirm
-> backend stores document metadata
GET /api/projects/{project_id}/documents
POST /api/projects/{project_id}/documents/{document_id}/extract
DELETE /api/projects/{project_id}/documents/{document_id}
```

The backend enforces:

- Allowed file extensions
- Allowed MIME types
- Per-document upload limits
- Total project upload limit
- Authenticated project ownership

Real R2 credentials must only be stored in local `.env` files or deployment secrets.

## Analysis API Flow

Phase 6 adds the Gemini-backed worker analysis flow:

```text
POST /api/projects/{project_id}/analyses/full
GET /api/projects/{project_id}/analyses/latest
GET /api/projects/{project_id}/analyses/{analysis_id}
POST /api/projects/{project_id}/analyses/{analysis_id}/retry
```

The worker uses extracted document text, validates Gemini JSON with Pydantic
schemas, calculates readiness score deterministically in backend code, and
stores the structured result in `analyses.result_json`.

## Deployment Target

Planned MVP deployment:

```text
Frontend: Vercel
Backend: VPS with Docker Compose
Database: PostgreSQL on VPS
Queue: Redis on VPS
Storage: Cloudflare R2
AI Provider: Google Gemini API
```

The frontend should use:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
```

The backend, worker, database, storage, and AI analysis pipeline are implemented locally. Frontend API integration and production reverse proxy configuration are still planned.

## Roadmap

Phase 0: Repository foundation - complete  
Phase 1: Static frontend UI with mock data - complete  
Phase 2: Backend foundation with FastAPI, database, auth, and project CRUD - complete  
Phase 3: Cloudflare R2 storage integration - complete  
Phase 4: Document parsing for PDF, DOCX, PPTX, and TXT - complete  
Phase 5: Queue and worker for asynchronous analysis - complete  
Phase 6: Gemini-powered structured analysis - complete  
Phase 7: Frontend API integration - next  
Phase 8: Markdown report export  
Phase 9: Beta safety, quotas, cleanup jobs, and deployment documentation

## Security and Privacy Notes

Planned production rules:

- Store secrets only in environment variables
- Use presigned URLs for file upload and download
- Do not expose storage credentials to the frontend
- Validate file type, MIME type, and size
- Enforce authenticated project ownership
- Avoid logging full document contents
- Delete raw uploaded files after the configured retention period
- Store generated exports with limited retention

## License

No license has been selected yet. All rights are reserved unless a license is added.

## Status

SidangReady AI is currently in MVP development. The backend can accept projects, upload metadata, parse supported documents, queue analysis jobs, and run Gemini-backed structured analysis. The frontend is still using mock data until Phase 7 connects it to the backend.

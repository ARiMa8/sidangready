# SidangReady AI

SidangReady AI is an LLM-powered thesis defense readiness and revision workflow assistant for Indonesian final-year students.

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
Phase 7: Frontend API integration complete
```

The repository now contains a real frontend-to-backend MVP flow: authentication, project dashboard, Cloudflare R2 document upload, document parsing, Redis-backed worker queue, Gemini-powered structured analysis, progress polling, and result pages. This is an LLM-powered document analysis SaaS foundation, not a full Agentic AI system. Real report file generation is planned for Phase 8.

## Product Positioning

SidangReady AI is currently an LLM-powered academic readiness platform and AI-powered thesis defense revision workflow assistant. It follows a bounded workflow around uploaded documents and generates structured outputs for student review.

The current MVP should not be described as full Agentic AI, an autonomous academic agent, an automated thesis writer, or a replacement for supervisors. Future versions may evolve toward a semi-agentic thesis revision workflow with project memory, planning, critique, re-analysis, and human approval.

## Features

Implemented in the current frontend:

- Landing page with product positioning and ethical disclaimer
- Login and register pages connected to backend auth
- Project dashboard connected to real backend projects
- Create project and document upload flow
- Direct-to-R2 upload through backend presigned URLs
- Document extraction trigger after upload
- Analysis queue trigger
- Analysis progress page with backend polling
- Readiness overview with score summary
- Revision checklist grouped by priority
- Checklist status update controls
- Slide consistency table
- Problematic claim cards
- Examiner question cards
- Presentation script panel
- Export report page connected to real analysis summary

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
- Result routes for overview, checklist, slide consistency, problematic claims, defense questions, and presentation script
- Checklist item status update route

Planned for the full MVP:

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
- Typed API client connected to the FastAPI backend

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

`apps/api` contains the FastAPI backend, storage integration, document parsing, queue worker, Gemini analysis orchestration, and result routes. `apps/web` contains the Next.js frontend connected to the backend API.

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

### Cloudflare R2 CORS

Browser direct uploads require CORS to be enabled on the R2 bucket. For local
development, allow the frontend origin:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Add the production frontend domain, such as the Vercel domain, before testing
uploads from production. Do not add R2 credentials to frontend code.

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

## Result API Flow

Phase 7 exposes persisted analysis results for the frontend:

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

`revision-checklist` is reserved for official user-provided thesis revision notes.
`checklist` contains AI findings and improvement actions from the readiness analysis.
The export page currently reads the latest analysis summary. Actual Markdown file
generation and download endpoints are planned for Phase 8.

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

The backend, worker, database, storage, AI analysis pipeline, and frontend API integration are implemented locally. Production reverse proxy configuration is still planned.

## Roadmap

Phase 0: Repository foundation - complete  
Phase 1: Static frontend UI with mock data - complete  
Phase 2: Backend foundation with FastAPI, database, auth, and project CRUD - complete  
Phase 3: Cloudflare R2 storage integration - complete  
Phase 4: Document parsing for PDF, DOCX, PPTX, and TXT - complete  
Phase 5: Queue and worker for asynchronous analysis - complete  
Phase 6: Gemini-powered structured analysis - complete  
Phase 7: Frontend API integration - complete  
Phase 8: Markdown report export - next  
Phase 9: Beta safety, quotas, cleanup jobs, and deployment documentation

## Agentic Terminology

- LLM-powered workflow: fixed flow that uses an LLM to analyze and generate structured outputs.
- Semi-agentic workflow: system has planner, memory/state, critique, and human approval, but still operates within a mostly bounded workflow.
- Bounded agentic workflow: system can observe state, plan, choose tools, act, evaluate, re-plan, and stop when a defined goal is reached, while remaining limited to the thesis defense/revision domain.

## Strategic Roadmap After Phase 8

### Phase 8 - Export Report Generation

- Generate Markdown final readiness report.
- Store export in R2.
- Add export metadata and download flow.
- This phase is not agentic yet.

### Phase 9 - Project Memory and Revision State

- Persist project goals such as target readiness score, deadline, defense date, and revision priority.
- Persist revision history and issue status over time.
- Track which critical issues are open, resolved, ignored, or need user review.
- Track document versions when users upload revised files.
- This phase introduces memory/state but is still not full agentic.

### Phase 10 - Semi-Agentic Revision Planner

- Add a planner service that creates a revision plan from latest analysis, target readiness, deadline, and unresolved issues.
- The planner should recommend next actions but not execute sensitive actions without user approval.
- Add a critic/review step that checks if generated plans are too vague, unsupported, or inconsistent with analysis evidence.
- Add explicit human approval before marking project as ready or exporting final report.
- This can be described as a semi-agentic workflow.

### Phase 11 - Bounded Agentic Workflow, Future Optional

- Add an observe-plan-act-evaluate loop.
- Allow the system to choose analysis tools dynamically depending on project state.
- Allow re-analysis after revised document upload.
- Allow the system to re-plan based on unresolved issues.
- Add clear stop conditions such as readiness target reached, no critical issues remaining, user approval, token budget limit, or deadline reached.
- Even then, describe it as a bounded domain-specific agentic workflow, not a general autonomous AI.

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

SidangReady AI is currently in MVP development. The frontend can authenticate users, create projects, upload documents, trigger extraction, queue analysis, poll progress, and render persisted backend results. Markdown export generation is the next major feature.

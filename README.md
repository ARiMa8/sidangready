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
Phase 1: Static frontend UI with mock data
```

Backend APIs, authentication, document parsing, Cloudflare R2 storage, queue workers, and Gemini analysis are planned for later phases.

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

Planned for the full MVP:

- Email and password authentication
- Project CRUD
- Presigned document upload flow
- Text extraction for PDF, DOCX, PPTX, and TXT
- Redis-backed analysis queue
- Google Gemini structured analysis
- Deterministic readiness score calculation
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

Planned backend:

- FastAPI
- Python 3.12+
- PostgreSQL
- Redis
- SQLAlchemy and Alembic
- Cloudflare R2 for object storage
- Google Gemini API for AI analysis
- Docker Compose for VPS deployment

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
      README.md
  .env.example
  .gitignore
  package.json
  package-lock.json
  README.md
```

`apps/api` is currently a placeholder. Backend implementation starts in a later phase.

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

For the current static frontend phase, no real API keys are required.

Important future variables are documented in `.env.example`, including:

- `NEXT_PUBLIC_API_BASE_URL`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
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

Current expected result:

```text
lint: pass
build: pass
```

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

The backend, worker, database, storage, and AI integration are not implemented in the current phase.

## Roadmap

Phase 0: Repository foundation  
Phase 1: Static frontend UI with mock data  
Phase 2: Backend foundation with FastAPI, database, auth, and project CRUD  
Phase 3: Cloudflare R2 storage integration  
Phase 4: Document parsing for PDF, DOCX, PPTX, and TXT  
Phase 5: Queue and worker for asynchronous analysis  
Phase 6: Gemini-powered structured analysis  
Phase 7: Frontend API integration  
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

SidangReady AI is currently in early MVP development. The repository contains a production-oriented frontend foundation, but the application is not ready for real document analysis until the backend, storage, queue, and AI pipeline are implemented.

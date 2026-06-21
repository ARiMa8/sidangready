# SidangReady AI

SidangReady AI is a Skripsi Defense & Revision Agent for Indonesian final-year students.

The product helps students prepare for thesis defense and organize post-defense revisions by reviewing documents they already own: a thesis report, defense slides, and revision notes.

## Product Promise

```text
Upload laporan skripsi + upload PPT sidang + paste/upload catatan revisi
-> AI analyzes thesis-defense readiness
-> AI produces revision checklist, slide consistency report, unsupported claim detection,
   examiner questions, presentation script, and final readiness report.
```

SidangReady AI is not a thesis-writing or academic cheating tool. It does not generate fake research data, fake citations, fake test results, or guaranteed outcomes.

## MVP Scope

Phase 0 and Phase 1 focus on the repository foundation and a static frontend UI with mock data:

- Landing page
- Login and register pages
- Dashboard project list
- Create project and document upload UI
- Analysis progress UI
- Results pages for overview, revision checklist, slide consistency, problematic claims, examiner questions, presentation script, and export

Backend APIs, Gemini integration, Cloudflare R2 storage, real auth, queue workers, and document parsing are intentionally deferred to later phases.

## Architecture Target

```text
Frontend: Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui-compatible components
Backend: FastAPI on VPS
Database: PostgreSQL on VPS
Queue: Redis on VPS
Worker: Python worker
Storage: Cloudflare R2
LLM: Google Gemini API only for MVP
```

## Repository Structure

```text
apps/
  web/   Static Next.js frontend for Phase 1
  api/   Placeholder for the future FastAPI backend
```

## Frontend Commands

From the repository root:

```bash
npm run dev
npm run lint
npm run build
```

Or from `apps/web`:

```bash
npm run dev
npm run lint
npm run build
```

## Ethical Use

All analysis output must be framed as AI-generated suggestions that need student and supervisor review. The app helps users understand, revise, and prepare; it must not promise approval, passing, or academic shortcuts.

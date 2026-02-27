# BuildSphere Development Workflow (Interview Narrative)

## 1. Problem Framing

Construction projects fail mainly due to:
- Delay in field updates
- Unstructured issue tracking
- Weak risk visibility for managers

BuildSphere solves this through a single command center for projects, tasks, logs, and risk insights.

## 2. User Roles

- Project Manager: Creates projects, monitors risk, drives escalation.
- Site Engineer: Updates daily progress and task status.
- Viewer/Vendor: Read-only or execution-specific collaboration.

## 3. Product Modules

1. Authentication and role-ready onboarding.
2. Project lifecycle management.
3. Task workflow (todo/in-progress/blocked/done).
4. Daily site reporting (planned vs actual, manpower, weather, safety).
5. Risk intelligence engine (score + recommendations).
6. OCR ingestion to convert documents into structured signals.
7. Predictive delay baseline model for proactive action.

## 4. Backend Workflow

1. User authenticates and receives JWT.
2. Auth middleware secures all project data APIs.
3. CRUD APIs store project/task/log data in MongoDB.
4. Analytics API merges data and computes risk via risk engine.
5. Frontend consumes this API to render decision dashboards.

## 5. Frontend Workflow

1. User logs in/registers.
2. Creates project and adds execution tasks.
3. Updates daily logs from site data.
4. Dashboard instantly reflects:
   - Progress
   - Open/blocked tasks
   - Risk score and suggestions

## 6. Interview Demo Flow (6-8 Minutes)

1. Explain business problem and why it matters.
2. Show architecture diagram (MERN + JWT + analytics service).
3. Live demo: create project, tasks, daily log, risk panel.
4. Highlight engineering decisions:
   - Modular controllers/routes
   - Validation with Zod
   - Reusable risk engine service
5. Close with scale roadmap:
   - OCR document ingestion
   - Predictive ML model
   - Mobile-first site app

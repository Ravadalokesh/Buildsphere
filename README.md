# BuildSphere - MERN Project

BuildSphere is a construction project intelligence platform :
- Multi-project control tower
- Daily site progress tracking
- Task and issue workflow
- Risk intelligence with actionable recommendations
- OCR document ingestion for site reports
- Predictive delay ML baseline for early warning



## Tech Stack

- Frontend: React + Vite + Axios
- Backend: Node.js + Express + JWT Auth
- Database: MongoDB + Mongoose

## Project Structure

```text
cpr/
  client/
  server/
  render.yaml
  docker-compose.yml
```

## Run Locally

1. Start MongoDB (Docker):
```bash
docker compose up -d
```

If Docker is not installed, use a local MongoDB service and set `MONGO_URI` in `server/.env`.

2. Backend setup:
```bash
cd server
copy .env.example .env
npm install
npm run dev
```

3. Frontend setup:
```bash
cd client
npm install
npm run dev
```

4. Open:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Deploy Free (Render + Atlas)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "BuildSphere deploy setup"
git branch -M main
git remote add origin <your_repo_url>
git push -u origin main
```

### 2. Create MongoDB Atlas Free Cluster

- Create Atlas project and `M0` free cluster.
- Create database user.
- Allow network access (`0.0.0.0/0`) for demo.
- Copy connection URI and set database name as `buildsphere`.

### 3. Deploy on Render

This repo includes `render.yaml`, so Render can create both services automatically.

- Backend service (`buildsphere-api`):
  - Root: `server`
  - Build: `npm install`
  - Start: `npm start`
  - Required env vars:
    - `MONGO_URI`
    - `JWT_SECRET`
    - `NODE_ENV=production`

- Frontend service (`buildsphere-web`):
  - Root: `client`
  - Build: `npm install && npm run build`
  - Publish: `dist`
  - Required env var:
    - `VITE_API_BASE_URL=https://<backend-url>/api`

### 4. Post-Deploy Checks

1. Open `https://<backend-url>/api/health` and confirm `ok: true`.
2. Open frontend URL and register/login.
3. Create project, tasks, daily log.
4. Test OCR upload using `.txt` file.
5. Run delay prediction and verify output appears.



## Future Upgrades (Talk Track)

- OCR/LLM ingestion of site reports and BOQ docs.
- Procurement vendor portal with approval workflows.
- Mobile app for site engineers with offline sync.
- Advanced ML model training using historical project outcomes.

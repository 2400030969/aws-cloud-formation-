# CloudStack frontend

React + Vite interface for the local CloudStack template-standardization demo.

## Run

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`. Start the Spring Boot backend separately at `http://localhost:8080` first. The API URL can be overridden with `VITE_API_URL` (default: `http://localhost:8080/api`).

The UI offers login/register, a data-driven dashboard, template CRUD, local YAML validation, saved template details, simulated deployments/history, a static GitHub-style preview, and profile. Deployment is simulation-only and no AWS or GitHub service is contacted.

Demo account: `admin@cloudstack.local` / `admin123`.

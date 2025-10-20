# coze-studio-lite

Minimal instructions for development: how to run the backend and the frontend (studio-lite app).

## Repository layout

- `backend/` - Go backend server
- `frontend/` - frontend workspace containing apps
	- `frontend/apps/studio-lite/` - Vite + React application (this project uses this app)

## Frontend (studio-lite)

The `studio-lite` app is located at `frontend/apps/studio-lite` and has its own `vite.config.ts`.

To start the dev server and serve the `studio-lite` app:

1. From the repository root you can run Vite with the app as the root:

```bash
# start Vite with the app root (recommended to ensure the correct vite.config is used)
npx vite --root frontend/apps/studio-lite --config frontend/apps/studio-lite/vite.config.ts
```

Or use the frontend package scripts and pass the `--root` flag:

```bash
npm --prefix frontend run dev -- --root apps/studio-lite --config apps/studio-lite/vite.config.ts
```

By default `vite.config.ts` in the app requests port `5173`. If port `5173` is already in use, Vite will pick another port (for example `5174`). If you need to force a specific port, pass `--port 5173`.

If you see a `404` when visiting `http://localhost:5173/`, it usually means the server running on that port is not serving the `studio-lite` app (often because another Vite process is running from `frontend/` root). To fix this, either stop the other process or start Vite with the correct `--root` as shown above.

## Backend

The backend is a Go application in `backend/`. Typical steps to run locally:

```bash
# build and run (from repository root)
cd backend
go run ./
```

The backend typically listens on port `8099` (see `backend/config.yaml` or application logs).

## Common troubleshooting

- Port conflicts: list listening processes with `ss -ltnp | grep 5173` and kill the PID if you want to free the port.
- Vite serving wrong root: ensure you start Vite with `--root frontend/apps/studio-lite` so it serves the app's `index.html`.
- If frontend API requests should reach the Go backend in dev, Vite config proxies `/api` to `http://127.0.0.1:8099` by default (see `frontend/apps/studio-lite/vite.config.ts`). Ensure the backend is running.

## Notes

- I added a minimal `index.html` and `src/main.tsx` in `frontend/apps/studio-lite` to provide an entry for development. If you prefer a monorepo setup where the root `frontend/` serves the app, adjust the root's Vite configuration or add a root `index.html`.

## Dev helper (Makefile)

This repository includes a `Makefile` convenience target to start both the backend and the `studio-lite` frontend in the background for local development.

- Start both services in background (writes logs and pid files to repo root):

```bash
make dev
```

This will:
- Start the backend with the configured `API_PORT` and `MYSQL_DSN`. Backend logs are written to `backend.log` and PID to `backend.pid`.
- Start the Vite dev server for `studio-lite` (runs from `frontend/apps/studio-lite`). Vite logs are written to `vite.log` and PID to `vite.pid`.

- Stop the background dev processes:

```bash
make dev-stop
```

Notes:
- Vite will try port 5173 by default. If 5173 is in use it will try subsequent ports (5174, 5175, ...). The Makefile does not force `--port 5173` to avoid failing when the port is occupied. If you prefer a fixed port, start Vite manually with `--port 5173`.
- If you prefer to run services in the foreground (for interactive logs), run:

```bash
# backend (foreground)
cd backend && API_PORT=8099 MYSQL_DSN="<dsn>" go run ./

# frontend (foreground)
cd frontend/apps/studio-lite && npx vite
```

PID/log file locations (repo root):
- backend.log — backend stdout/stderr
- backend.pid — backend PID
- vite.log — vite stdout/stderr
- vite.pid — vite PID

If you see unexpected 404s or requests not reaching the backend, check:
- which process is listening on 5173: `ss -ltnp | grep 5173`
- whether the running Vite instance is started from `frontend/apps/studio-lite` (it should be) or from `frontend/` root (which can cause routing/proxy issues).

## Exposing to the public internet

If you need to access the dev server from a public IP (for testing on devices or remote access), you have two main options:

1) Bind services to 0.0.0.0 and open firewall/NAT

- Use the Makefile helper which binds Vite to `0.0.0.0:5173` and the backend to the configured `API_PORT`:

```bash
make dev-public
```

- Ensure your host firewall (ufw/iptables) or cloud security group allows inbound traffic to the chosen ports (5173, 8099).

2) Use an SSH tunnel or ngrok (recommended for short-lived testing)

- SSH local port forwarding (from your laptop):

```bash
# forward remote port 5173 to local 5173
ssh -L 5173:localhost:5173 user@your-remote-host
```

- Or use ngrok to expose a local port securely:

```bash
ngrok http 5173
```

Security note: Exposing development servers publicly can expose sensitive data. Only open ports you need, prefer SSH tunnels or temporary tunnels (ngrok), and never run production credentials in dev with public exposure.

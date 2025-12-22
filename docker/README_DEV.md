# Development Mode with Docker

This setup allows you to develop directly inside the Docker container without rebuilding every time you make changes!

## How It Works

Instead of copying files into the image (production), we **mount your source code as volumes** into the container. This means:
- ✅ Changes to your code are immediately visible
- ✅ FastAPI auto-reloads when you change Python files (thanks to `RELOAD=true`)
- ✅ Frontend changes (HTML/JS/CSS) are visible immediately
- ✅ No need to rebuild the container for every change
- ✅ Same environment as production, but with live development

## Quick Start

### Start Development Container

```bash
cd /home/joel/dev/TurretReplit
docker-compose -f docker/docker-compose.dev.yml up -d
```

### View Logs

```bash
docker-compose -f docker/docker-compose.dev.yml logs -f
```

### Stop Development Container

```bash
docker-compose -f docker/docker-compose.dev.yml down
```

## Development vs Production

| Feature | Development (`docker-compose.dev.yml`) | Production (`docker-compose.yml`) |
|---------|--------------------------------------|----------------------------------|
| **Code Changes** | Instant (volume mounts) | Requires rebuild |
| **Auto-reload** | ✅ Enabled (`RELOAD=true`) | ❌ Disabled |
| **DEV_MODE** | ✅ `true` | ❌ `false` |
| **Container Name** | `turret-defense-dev` | `turret-defense` |
| **Rebuild Needed** | Only for dependency changes | Every code change |

## When to Rebuild

You only need to rebuild the development container when:
- Adding/removing Python dependencies (change `pyproject.toml`)
- Changing the Dockerfile itself
- Updating system packages

To rebuild:
```bash
docker-compose -f docker/docker-compose.dev.yml up -d --build
```

## Workflow

1. **Start development container:**
   ```bash
   docker-compose -f docker/docker-compose.dev.yml up -d
   ```

2. **Make changes to your code** (backend/server.py, frontend files, etc.)

3. **See changes immediately:**
   - Python changes: FastAPI auto-reloads (watch the logs)
   - Frontend changes: Refresh browser

4. **When done developing:**
   ```bash
   docker-compose -f docker/docker-compose.dev.yml down
   ```

5. **For production deployment:**
   ```bash
   ./docker/deploy.sh  # Uses production docker-compose.yml
   ```

## Tips

- Keep the logs open in a terminal: `docker-compose -f docker/docker-compose.dev.yml logs -f`
- The container runs on port 3000, same as production
- You can run both dev and production containers simultaneously if you use different ports
- Volume mounts are read-only (`:ro`) to prevent accidental writes inside the container





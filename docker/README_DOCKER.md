# Docker Setup for Turret Defense

## Quick Start

### Build and run with Docker Compose:
```bash
cd /home/joel/dev/TurretReplit
docker-compose -f docker/docker-compose.yml up -d
```

### Build and run with Docker directly:
```bash
cd /home/joel/dev/TurretReplit
docker build -f docker/Dockerfile -t turret-defense .
docker run -d -p 3000:3000 --name turret-defense turret-defense
```

## Why Docker?

✅ **Portability** - Run the same container anywhere (local, cloud, different machines)
✅ **Isolation** - No conflicts with system Python or other projects
✅ **Consistency** - Same environment every time
✅ **Easy deployment** - One command to start/stop
✅ **Easy updates** - Rebuild and redeploy without affecting your system
✅ **Production-ready** - Can easily deploy to cloud platforms

## Deploying Changes

**After making changes to your scripts (e.g., `backend/server.py`):**

### Quick Deploy (Recommended)
```bash
./docker/deploy.sh
```

Or from anywhere:
```bash
/home/joel/dev/TurretReplit/docker/deploy.sh
```

### Manual Deploy
```bash
cd /home/joel/dev/TurretReplit
docker-compose -f docker/docker-compose.yml build
docker-compose -f docker/docker-compose.yml up -d --force-recreate
```

Or in one command:
```bash
docker-compose -f docker/docker-compose.yml up -d --build --force-recreate
```

**How container recreation works:**
- `--build` rebuilds the Docker image with your latest code changes
- `--force-recreate` ensures the container is stopped and recreated with the new image
- This works even if the container was started by systemd, because docker-compose manages the container lifecycle
- The new container will automatically start and pick up your changes

**Alternative: Using systemd service** (if you have the service installed):
```bash
sudo systemctl stop turret-defense
cd /home/joel/dev/TurretReplit
docker-compose -f docker/docker-compose.yml build
sudo systemctl start turret-defense
```

## Management Commands

```bash
# Start
docker-compose -f docker/docker-compose.yml up -d

# Stop
docker-compose -f docker/docker-compose.yml down

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Restart (without rebuilding - use --build to include changes)
docker-compose -f docker/docker-compose.yml restart

# Rebuild after changes (RECOMMENDED for deploying updates)
docker-compose -f docker/docker-compose.yml up -d --build
```

## Integration with Cloudflare Tunnel

The container runs on port 3000, which is already configured in your cloudflared tunnel at `turret.horowitz.com`. Just make sure the container is running!

## Notes

- The Dockerfile uses a multi-stage build to keep the image size small
- Static files (sprites, sounds, fonts) are included in the image
- The container runs the FastAPI server directly (no Poetry needed at runtime)
- Health checks are configured for monitoring

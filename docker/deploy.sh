#!/bin/bash

# Deployment script for Turret Defense
# Rebuilds and restarts the Docker container with latest changes
#
# How it works:
# 1. Builds a new Docker image with your latest code changes
# 2. Forces recreation of the container with the new image
# 3. This works even if the container was started by systemd service,
#    because docker-compose manages the container lifecycle

set -e  # Exit on error

# Get the project root directory (parent of docker/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying Turret Defense..."
echo "📁 Project root: $PROJECT_ROOT"

cd "$PROJECT_ROOT"

echo "🔨 Building new image..."
docker-compose -f docker/docker-compose.yml build

echo "🛑 Stopping and removing existing container..."
# First try docker-compose down (in case container was created by compose)
docker-compose -f docker/docker-compose.yml down 2>/dev/null || true

# Also explicitly stop and remove the container by name (in case it was started manually or by systemd)
CONTAINER_NAME="turret-defense"
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "   Removing container: ${CONTAINER_NAME}"
    docker stop "${CONTAINER_NAME}" 2>/dev/null || true
    docker rm "${CONTAINER_NAME}" 2>/dev/null || true
fi

echo "🔄 Starting container with new image..."
docker-compose -f docker/docker-compose.yml up -d

echo "✅ Deployment complete!"
echo ""
echo "📊 Container status:"
docker-compose -f docker/docker-compose.yml ps

echo ""
echo "📝 Recent logs (last 20 lines):"
docker-compose -f docker/docker-compose.yml logs --tail=20

echo ""
echo "💡 To view live logs, run:"
echo "   docker-compose -f docker/docker-compose.yml logs -f"

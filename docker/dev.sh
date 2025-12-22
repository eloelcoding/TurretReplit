#!/bin/bash

# Development script for Turret Defense
# Starts the container with volume mounts for live development

set -e  # Exit on error

# Get the project root directory (parent of docker/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔧 Starting Turret Defense in DEVELOPMENT mode..."
echo "📁 Project root: $PROJECT_ROOT"

cd "$PROJECT_ROOT"

echo "🚀 Starting development container with live code mounting..."
docker-compose -f docker/docker-compose.dev.yml up -d

echo "✅ Development container started!"
echo ""
echo "📊 Container status:"
docker-compose -f docker/docker-compose.dev.yml ps

echo ""
echo "📝 Recent logs (last 20 lines):"
docker-compose -f docker/docker-compose.dev.yml logs --tail=20

echo ""
echo "💡 Useful commands:"
echo "   View logs:    docker-compose -f docker/docker-compose.dev.yml logs -f"
echo "   Stop:        docker-compose -f docker/docker-compose.dev.yml down"
echo "   Rebuild:     docker-compose -f docker/docker-compose.dev.yml up -d --build"
echo ""
echo "🎮 Your app is running at http://localhost:3000"
echo "   Changes to your code will be reflected automatically!"





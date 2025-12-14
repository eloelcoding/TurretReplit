#!/bin/bash

cd "$(dirname "$0")/backend"

# Set default port if not already set
export PORT=${PORT:-3010}

# Set dev mode for local development
export DEV_MODE=${DEV_MODE:-true}

# Kill any existing server process on this port
echo "Checking for existing server process..."
EXISTING_PID=$(lsof -ti:${PORT} 2>/dev/null || pgrep -f "python.*server.py" | head -1)
if [ ! -z "$EXISTING_PID" ]; then
    echo "Killing existing server process (PID: $EXISTING_PID)..."
    kill $EXISTING_PID 2>/dev/null || true
    sleep 1
    # Force kill if still running
    kill -9 $EXISTING_PID 2>/dev/null || true
fi

# Open browser after a short delay to let server start
hostname=$(hostname)
(sleep 1 && xdg-open http://${hostname}:${PORT}) &

# Start the backend server
poetry run python server.py


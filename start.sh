#!/bin/bash

cd "$(dirname "$0")/backend"

# Set default port if not already set
export PORT=${PORT:-3010}

# Set dev mode for local development
export DEV_MODE=${DEV_MODE:-true}

# Open browser after a short delay to let server start
(sleep 1 && xdg-open http://localhost:${PORT}) &

# Start the backend server
poetry run python server.py


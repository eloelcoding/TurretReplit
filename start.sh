#!/bin/bash

cd "$(dirname "$0")/backend"

# Open browser after a short delay to let server start
(sleep 1 && xdg-open http://localhost:3000) &

# Start the backend server
poetry run python server.py


# Multi-stage build for Turret Defense game
FROM python:3.12-slim as builder

# Install Poetry (latest version that supports package-mode)
RUN pip install --no-cache-dir poetry

# Set working directory
WORKDIR /app

# Copy dependency files
COPY backend/pyproject.toml backend/poetry.lock ./

# Configure poetry to not create virtual environment (we're in a container)
RUN poetry config virtualenvs.create false

# Install dependencies (Poetry 2.x uses --only=main instead of --no-dev)
RUN poetry install --only=main --no-interaction --no-ansi

# Production stage
FROM python:3.12-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application files
COPY backend/server.py ./backend/
COPY index.html ./
COPY lib/ ./lib/
COPY sprites/ ./sprites/
COPY assets/ ./assets/
COPY sketch.js ./

# Expose port
EXPOSE 3000

# Run the server
CMD ["python", "backend/server.py"]

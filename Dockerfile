# Frontend build
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install || true
COPY frontend ./
RUN npm run build || true

# Backend runtime
FROM python:3.11-slim AS backend
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY backend ./backend
COPY content ./content
COPY public ./public
COPY --from=frontend /app/frontend/dist ./frontend_dist
RUN pip install --no-cache-dir "uvicorn[standard]" fastapi pydantic python-multipart
# Use PORT env var for Render, default to 8000 for local
CMD uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}

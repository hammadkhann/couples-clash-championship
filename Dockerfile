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
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]

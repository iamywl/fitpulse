# Multi-stage build for cross-platform support (macOS Apple Silicon arm64 & Windows/Linux x86_64)

# Stage 1: Build static assets (Node.js build stage runs natively on host platform)
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
ARG BUILDPLATFORM

WORKDIR /app

# Cache package installation layers
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Production Nginx Server (Ultra-lightweight ~25MB runner)
FROM nginx:alpine AS runner

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

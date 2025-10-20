# =============================================================================
# Backend Dockerfile - Optimized for Railway Deployment
# =============================================================================
FROM node:18-alpine AS base

# Install build dependencies for native modules (mediasoup requires these)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    musl-dev \
    linux-headers \
    git

WORKDIR /app

# =============================================================================
# Dependencies Stage - Caching layer for faster rebuilds
# =============================================================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci

# =============================================================================
# Production Dependencies Stage
# =============================================================================
FROM base AS prod-dependencies

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# =============================================================================
# Build Stage
# =============================================================================
FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Create necessary directories
RUN mkdir -p uploads logs

# =============================================================================
# Production Stage - Final optimized image
# =============================================================================
FROM node:18-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies
COPY --from=prod-dependencies /app/node_modules ./node_modules

# Copy application code
COPY --from=build --chown=nodejs:nodejs /app/src ./src
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./
COPY --from=build --chown=nodejs:nodejs /app/uploads ./uploads
COPY --from=build --chown=nodejs:nodejs /app/logs ./logs

# Switch to non-root user for security
USER nodejs

# Expose ports
# HTTP server port (Railway will assign this dynamically via $PORT)
EXPOSE 5000

# MediaSoup RTC ports (UDP for WebRTC)
EXPOSE 10000-10100/udp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "src/server.js"]
# =============================================================================
# Frontend Dockerfile - Optimized for Railway Deployment
# =============================================================================
FROM node:18-alpine AS base

WORKDIR /app

# =============================================================================
# Dependencies Stage - Caching layer
# =============================================================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm ci

# =============================================================================
# Build Stage - Create production build
# =============================================================================
FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Build the React app
RUN npm run build

# =============================================================================
# Production Stage - Serve with nginx
# =============================================================================
FROM nginx:alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001 \
    && chown -R nodejs:nodejs /usr/share/nginx/html \
    && chown -R nodejs:nodejs /var/cache/nginx \
    && chown -R nodejs:nodejs /var/log/nginx \
    && chown -R nodejs:nodejs /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nodejs:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nodejs

# Expose port (Railway will use $PORT)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
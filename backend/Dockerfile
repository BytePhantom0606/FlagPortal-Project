# ============================================
# FlagForge Backend - Multi-stage Dockerfile
# ============================================

# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl openssl

# Stage 2: Dependencies
FROM base AS dependencies
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Stage 3: Build (for Prisma generation)
FROM base AS build
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

# Stage 4: Production
FROM base AS production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies and built files
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=nodejs:nodejs . .

# Create necessary directories with correct permissions
RUN mkdir -p uploads logs && \
    chown -R nodejs:nodejs uploads logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]

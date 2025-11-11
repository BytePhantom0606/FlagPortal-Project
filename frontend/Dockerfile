# ============================================
# FlagForge Frontend - Multi-stage Dockerfile
# ============================================

# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build arguments for API URL
ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL

# Build application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine AS production

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

# ─── Stage 1: Build ────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy only package files first for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build args for Vite environment variables at build time
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# ─── Stage 2: Serve with Nginx ─────────────────────────────
FROM nginx:alpine AS production

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

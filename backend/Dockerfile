# ─── Stage 1: Dependencies ─────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Copy only package files first for layer caching
COPY package.json package-lock.json ./
RUN npm ci --only=production

# ─── Stage 2: Production image ─────────────────────────────
FROM node:22-alpine AS production

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

# Expose port (configurable via PORT env var)
EXPOSE 5000

# Set production environment defaults
ENV NODE_ENV=production \
    PORT=5000

# Health check using the /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:'+process.env.PORT+'/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]

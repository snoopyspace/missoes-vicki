# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm with specific version
RUN npm install -g pnpm@10.4.1 --force

# Copy package files
COPY package.json ./

# Install all dependencies (including dev)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.4.1 --force

# Copy package files
COPY package.json ./

# Install production dependencies only
RUN pnpm install --no-frozen-lockfile --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Create data directory for persistence
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start the application
CMD ["node", "dist/index.js"]

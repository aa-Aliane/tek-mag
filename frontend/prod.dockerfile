# Build stage
FROM node:22.16-alpine AS builder

WORKDIR /code

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22.16-alpine AS runner

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create and set ownership of the working directory
RUN mkdir -p /code && chown appuser:appgroup /code

WORKDIR /code

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder --chown=appuser:appgroup /code/.next ./.next
COPY --from=builder --chown=appuser:appgroup /code/public ./public
COPY --from=builder --chown=appuser:appgroup /code/next.config.ts ./next.config.ts

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

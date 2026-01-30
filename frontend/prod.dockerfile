FROM node:22.16-alpine AS builder

WORKDIR /code

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --include=dev

# Copy source and build
COPY . .
RUN npm run build

# Production
FROM node:22.16-alpine

WORKDIR /app

# Copy necessary files
COPY --from=builder /code/package.json ./
COPY --from=builder /code/package-lock.json* ./
COPY --from=builder /code/next.config.ts ./
COPY --from=builder /code/public ./public
COPY --from=builder /code/.next ./.next
COPY --from=builder /code/node_modules ./node_modules

# Expose port
EXPOSE 3000

ENV NODE_ENV=production

# Start Next.js
CMD ["npm", "start"]

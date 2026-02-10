FROM node:22.16-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (need dev deps for build)
RUN npm ci

# Copy ALL source code (app/, src/, pages/, etc.)
COPY . .

EXPOSE 3000
ENV NODE_ENV=production

# Will be overridden by docker-compose command

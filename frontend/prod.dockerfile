FROM node:22.16-alpine AS builder

WORKDIR /code

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Build the app
COPY . .
RUN npm run build

# Production
FROM nginx:alpine

COPY --from=builder /code/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

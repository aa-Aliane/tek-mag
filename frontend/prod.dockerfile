FROM node:22.16-alpine AS builder

WORKDIR /code

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies - use npm install if package-lock doesn't exist
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production
FROM nginx:alpine

COPY --from=builder /code/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

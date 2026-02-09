FROM oven/bun:1-alpine AS base

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --no-verify

# Build the application
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA (Vue Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

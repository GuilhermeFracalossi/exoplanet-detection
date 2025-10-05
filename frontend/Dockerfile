# Stage 1: Build the static assets using Bun
FROM oven/bun:latest AS build

WORKDIR /app

# Copy dependency manifests and install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy the rest of the source code and build the project
COPY . .
RUN bun run build

COPY dados_exemplo.csv /app/dist/

# Stage 2: Serve the static assets with Nginx
FROM nginx:stable-alpine

# Copy the built files from the 'build' stage's 'dist' folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration file (optional but recommended)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
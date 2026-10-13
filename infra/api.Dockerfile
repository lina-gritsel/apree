FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace @sobrano/api --include-workspace-root=false
COPY apps/api apps/api
RUN npm run db:generate && npm run build -w @sobrano/api
USER node
EXPOSE 3001
CMD ["sh", "-c", "npm run db:migrate && npm run start -w @sobrano/api"]

# Production image: builds the React app, then serves it from the Express
# backend's public/ folder. Rebuilt on every `docker compose up --build`.

# ---- Stage 1: build the frontend into dist/ ----
FROM node:22-alpine AS frontend
WORKDIR /frontend

COPY Frontend/package*.json ./
RUN npm install

COPY Frontend/ ./
RUN npm run build

# ---- Stage 2: backend + built frontend ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY Backend/package*.json ./
RUN npm install --omit=dev

COPY Backend/ ./
# Replace whatever public/ was in the repo with the fresh build.
RUN rm -rf public
COPY --from=frontend /frontend/dist ./public

EXPOSE 3000
CMD ["node", "server.js"]

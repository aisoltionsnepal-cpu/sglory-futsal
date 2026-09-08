FROM node:18-slim

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

COPY backend/ ./backend/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "backend/server.js"]

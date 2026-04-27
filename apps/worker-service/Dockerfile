FROM node:20-alpine

WORKDIR /app

COPY apps/worker-service/package.json ./apps/worker-service/package.json
RUN cd apps/worker-service && npm install

COPY apps/worker-service ./apps/worker-service

WORKDIR /app/apps/worker-service

CMD ["npm", "start"]

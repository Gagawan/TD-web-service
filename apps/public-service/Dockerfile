FROM node:20-alpine

WORKDIR /app

COPY apps/public-service/package.json ./apps/public-service/package.json
RUN cd apps/public-service && npm install

COPY apps/public-service ./apps/public-service

WORKDIR /app/apps/public-service

EXPOSE 3000
CMD ["npm", "start"]

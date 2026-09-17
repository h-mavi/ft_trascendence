FROM node:24-alpine

WORKDIR /app

RUN apk add redis

COPY ./app/package*.json ./
RUN npm install

COPY ./app/ ./
COPY ./app/prisma ./prisma

COPY ./script/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

CMD ["/entrypoint.sh"]

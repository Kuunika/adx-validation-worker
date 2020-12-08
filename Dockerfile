FROM node:10-alpine3.9
WORKDIR /adx-validation-worker
COPY . .
RUN cd /adx-validation-worker && npm i --only=prod
RUN apk upgrade && apk add bash
FROM node:12.14.1-alpine

RUN apk update

COPY ../../package.json ./
RUN npm i -g cross-env nodemon ts-node
RUN yarn install --silent

COPY ./compose/wait /wait
RUN chmod +x /wait

RUN mkdir -p /usr/src/app
COPY ../.. /usr/src/app
WORKDIR /usr/src/app

RUN /wait

CMD yarn watch

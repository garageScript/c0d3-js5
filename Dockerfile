FROM node:14-alpine
RUN apk update && apk upgrade && apk add python3 && \
    apk add --no-cache git
RUN apk add g++ make python3

WORKDIR /usr/src/app

COPY ./package.json .
COPY ./yarn.lock .
RUN yarn install --production
COPY . .
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80

CMD [ "yarn", "start" ]

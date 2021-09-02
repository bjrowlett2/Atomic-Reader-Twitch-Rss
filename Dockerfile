FROM node:16.7.0

ENV TWITCH_CLIENT_ID=
ENV TWITCH_CLIENT_SECRET=

WORKDIR /app

COPY [ ".", "./" ]
RUN [ "npm", "install" ]
ENTRYPOINT [ "node", "src/main.js" ]

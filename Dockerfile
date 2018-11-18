FROM node:10

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

WORKDIR /kansa
COPY server/package.json .
COPY common/package.json ./common/
COPY modules/events/server/package.json modules/events/server/
COPY modules/raami/server/package.json modules/raami/server/
COPY modules/shop/server/package.json modules/shop/server/
COPY modules/slack/server/package.json modules/slack/server/

RUN npm install && \
    npm install ./common && \
    for m in events raami shop slack; \
    do \
        cd /kansa/modules/$m/server && \
        npm install; \
    done && \
    npm cache clean --force

COPY common ./common
COPY modules ./modules
COPY server .

EXPOSE 80
CMD [ "npm", "start" ]

FROM node:10

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

WORKDIR /kansa
COPY server/package.json .
COPY common/package.json ./common/
RUN npm install && \
    npm install ./common && \
    npm cache clean --force

COPY modules/raami/server/package.json modules/raami/server/
RUN cd modules/raami/server && npm install && npm cache clean --force

COPY modules/shop/server/package.json modules/shop/server/
RUN cd modules/shop/server && npm install && npm cache clean --force

COPY modules/slack/server/package.json modules/slack/server/
RUN cd modules/slack/server && npm install && npm cache clean --force

COPY common ./common
COPY modules ./modules
COPY server .

EXPOSE 80
CMD [ "npm", "start" ]

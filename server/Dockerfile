FROM node:10

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

RUN mkdir -p /kansa/modules
WORKDIR /kansa
COPY package.json .
RUN npm install && npm cache clean --force
COPY . .
RUN npm install ./kansa-common.tgz

EXPOSE 80
CMD [ "npm", "start" ]

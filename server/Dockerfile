FROM node:10

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

RUN mkdir -p /kansa/modules
WORKDIR /kansa
COPY package.json /kansa/
RUN npm install && npm cache clean --force
COPY . /kansa

EXPOSE 80
CMD [ "npm", "start" ]

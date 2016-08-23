FROM node:6

# from node:6-onbuild
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

ARG host=localhost:4430
ARG title=Kansa
ENV NODE_ENV=production KANSA_API_HOST="${host}" KANSA_TITLE="${title}"
ENTRYPOINT ["./node_modules/.bin/webpack"]
CMD ["-p"]

# Worldcon 75 Member Services 
[![DockerPulls](https://img.shields.io/docker/stars/worldcon75/api.svg)](https://hub.docker.com/r/worldcon75/api/) [![Build Status](https://travis-ci.org/jautero/api.svg?branch=master)](https://travis-ci.org/jautero/api)

This project is under active development, so not everything is ready yet. The main components are:

- **`client`** - The client front-end for our membership; a react + redux single-page app
- **`docker-compose.yml`** - Service configuration
- **`hakkapeliitta`** - A deprecated Scala webshop implementation, due to be ported to node.js
- **`hugo/server`** - An express.js app providing the `/api/hugo/` parts of [this API](API.md)
- **`kansa/server`** - An express.js app providing the `/api/kansa/` parts of [this API](API.md)
- **`kansa/importer`** - A tool for importing CSV & JSON data from our prior registry format
- **`kansa/admin`** - An internal front-end for the registry data; a react + redux single-page app
- **`nginx`** - An SSL-terminating reverse proxy for Kansa
- **`postgres`** - Configuration & schemas for our database

[Kansa](https://en.wiktionary.org/wiki/kansa#Finnish) is Finnish for "people" or "tribe", and it's
the name for our member registry. The [Hugo Awards](http://www.thehugoawards.org/) are awards that
are nominated and selected by the members of each year's Worldcon.


### Installation & Configuration

To get a dev environment up and running, first clone this repo with `git clone --recursive`, or run
`git submodule update --init` after cloning. The database and server are set up to be run using
[docker-compose](https://docs.docker.com/compose/); for other tools you'll need a recent-ish version
of node.

Here's a series of commands that should get the full working system installed and operational,
provided that `git`, `docker-compose` and `npm` are already installed:

```
git clone --recursive https://github.com/worldcon75/api.git w75-api
cd w75-api
docker-compose up --build -d  # leave out the -d to not detach
cd client
npm install && npm start
```

Once you have all the services up and running, first visit `https://localhost:4430/` in your
browser to trigger its complaint about the server's self-singed certificate, and bypass it:
  - **Chrome**: Click on _Advanced_, then _Proceed to example.com_
  - **Firefox**: Click on _I Understand the Risks_, then _Add Exception...._, then _Get
    Certificate_, and finally _Confirm Security Exception_
  - **IE**: Click on _Continue to this website (not recommended)_
  - **Safari**: Click on _Show Certificate_, _Always Trust "example.com" when connecting to
    "example.com"_, then _Continue_

Once that's done, visiting `http://localhost:8080/` should redirect you to the login page, where
the bootstrapped admin account is available as email `admin@example.com`, and key `key`. Visiting
the address `http://localhost:8080/#/login/admin@example.com/key` should also automatically log
you in.

Currently, `kansa/admin` is set up to run completely separately from `client`, but using the same
server address `http://localhost:8080/`. To use it, it may be easier to login first using `client`,
or by visiting the API endpoint `https://localhost:4430/api/kansa/login?email=admin@example.com&key=key`
to set the proper auth cookie.


### Common Issues

The particular places that may need manual adjustment are:

- Connections to the server require TLS (HTTPS, WSS). For ease of development the repo includes a
  [self-signed certificate](http://www.selfsignedcertificate.com/) for `localhost`. This will not
  be automatically accepted by browsers or other clients. If you have a signed certificate you can
  use (and therefore a publicly visible address), you'll want to add the certificate files to
  `nginx/ssl/` and adjust the environment values set for the `nginx` service in
  [docker-compose.yml](docker-compose.yml).

- The `CORS_ORIGIN` variables in [hugo/server/dev.env](hugo/server/dev.env) and
  [kansa/server/dev.env](kansa/server/dev.env) need to be space- or comma-separated lists of
  addresses at which client apps may be hosted, to allow for Cross-Origin Resource Sharing. By
  default, the value should match the `http://localhost:8080` address of the `client` and
  `kansa/admin` Webpack dev servers started by `npm start` in each directory.

- If you're running the server on a separate machine or if you've changed the `nginx` port
  configuration, you may need to tell clients where to find the server, using something like
  `export API_HOST='remote.example.com'` before running `npm start`. The default is set
  [here](client/webpack.config.js) to `localhost:4430'` or the address of your Docker VM.


----

If you'd like to help with this project, please get in touch with us at
[devops@worldcon.fi](mailto:devops@worldcon.fi).

[![DockerPulls](https://img.shields.io/docker/stars/worldcon75/api.svg)](https://hub.docker.com/r/worldcon75/api/)
[![Build Status](https://travis-ci.org/worldcon75/api.svg?branch=master)](https://travis-ci.org/worldcon75/api)
# Worldcon 75 Member Services API

These are the back-end services used by [members.worldcon.fi](https://members.worldcon.fi/):

- **`docker-compose*.yml`** - Service configuration
- **`hakkapeliitta`** - A deprecated Scala webshop implementation, due to be ported to node.js
- **`hugo/server`** - An express.js app providing the `/api/hugo/` parts of [this API](API.md)
- **`kansa/server`** - An express.js app providing the `/api/kansa/` parts of [this API](API.md)
- **`kansa/importer`** - A tool for importing CSV & JSON data from our prior registry format
- **`kyyhky`** - Internal mailing service for hugo & kansa, using [Kue](http://automattic.github.io/kue/)
- **`nginx`** - An SSL-terminating reverse proxy for Kansa
- **`postgres`** - Configuration & schemas for our database

[Kansa](https://en.wiktionary.org/wiki/kansa#Finnish) is Finnish for "people" or "tribe", and it's
the name for our member registry. The [Hugo Awards](http://www.thehugoawards.org/) are awards that
are nominated and selected by the members of each year's Worldcon. Kyyhky is Finnish for "pigeon".

For the front-end code, please see [worldcon75/client](https://github.com/worldcon75/client).


### Getting Started

To get a dev environment up and running, first clone this repo with `git clone --recursive`, or run
`git submodule update --init` after cloning. The database and server are set up to be run using
[docker-compose](https://docs.docker.com/compose/); for other tools you'll need a recent-ish version
of node if you want to build them locally.

Here's a series of commands that should get the full working system installed and operational,
provided that `git`, `docker-compose` and `npm` are already installed:

```
git clone --recursive https://github.com/worldcon75/api.git w75-api
cd w75-api
docker-compose up --build -d  # leave out the -d to not detach
```

Once you have all the services up and running, your development server should be available at
`https://localhost:4430/`, including a latest-release front-end client (with code hosted under
GitHub Pages). You'll need to bypass your browser's complaint about the server's self-singed
certificate:
  - **Chrome**: Click on _Advanced_, then _Proceed to example.com_
  - **Firefox**: Click on _I Understand the Risks_, then _Add Exception...._, then _Get
    Certificate_, and finally _Confirm Security Exception_
  - **IE**: Click on _Continue to this website (not recommended)_
  - **Safari**: Click on _Show Certificate_, _Always Trust "example.com" when connecting to
    "example.com"_, then _Continue_
  - **`curl`**: Use the `-k` or `--insecure` flag to perform "insecure" SSL connections

The development server is bootstrapped with an admin account `admin@example.com` using the key
`key`, which you may login as by visiting either of the addresses
[`https://localhost:4430/login/admin@example.com/key`](https://localhost:4430/login/admin@example.com/key)
(for smooth browser redicretion) or
[`https://localhost:4430/api/kansa/login?email=admin@example.com&key=key`](`https://localhost:4430/api/kansa/login?email=admin@example.com&key=key`)
(direct login, with JSON response).


### Configuration

For production use and otherwise, the services' configuration is controlled by the Docker Compose
config files. By default, `docker-compose` will include both [docker-compose.yml](docker-compose.yml)
and [docker-compose.override.yml](docker-compose.override.yml); the former acts as the base config,
which the latter expands/overrides with development-specific configuration. For production use, the
base config will instead need to be overridden by [docker-compose.prod.yml](docker-compose.prod.yml)
(see [`make prod`](Makefile)).

For the most part, services are configured using environment variables, some of which need to match
across services:
  - `SESSION_SECRET` allows hugo/server and kansa/server to share authenticated sessions
  - `DATABASE_URL` and `*_PG_PASSWORD` are required for the services' database connections


### Common Issues

The particular places that may need manual adjustment are:

- Connections to the server require TLS (HTTPS, WSS). For ease of development the repo includes a
  [self-signed certificate](http://www.selfsignedcertificate.com/) for `localhost`. This will not
  be automatically accepted by browsers or other clients. If you have a signed certificate you can
  use (and therefore a publicly visible address), you'll want to add the certificate files to
  `nginx/ssl/` and adjust the environment values set for the `nginx` service in
  [docker-compose.override.yml](docker-compose.override.yml) and/or
  [docker-compose.prod.yml](docker-compose.prod.yml).

- The `CORS_ORIGIN` variables in the docker-compose config files need to be space-separated lists of
  addresses at which client apps may be hosted, to allow for Cross-Origin Resource Sharing. By
  default, the value should match the `http://localhost:8080` address of the client Webpack dev
  servers.

- If you're running the server on a separate machine or if you've changed the `nginx` port
  configuration, you may need to tell clients where to find the server, using something like
  `export API_HOST='remote.example.com'` before running `npm start`.


----

If you'd like to help with this project, please get in touch with us at
[devops@worldcon.fi](mailto:devops@worldcon.fi).

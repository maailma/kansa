# Worldcon 75 Member Services [![DockerPulls](https://img.shields.io/docker/stars/worldcon75/api.svg)](https://hub.docker.com/r/worldcon75/api/)

This project is under active development, so not everything is ready yet. The main components are:

- **`docker-compose.yml`** - Service configuration
- **`hakkapeliitta`** - A deprecated Scala webshop implementation, due to be ported to node.js
- **`kansa/server`** - An express.js app providing
  [this API](https://docs.google.com/document/d/1N4R6jkSEpOc0oAfHK_xN2PtHWkepcKfsrpIR3f_IsAs/edit?usp=sharing)
- **`kansa/importer`** - A tool for importing CSV & JSON data from our prior registry format
- **`kansa/admin`** - An internal front-end for the registry data; a react + redux single-page app
- **`kansa/member`** - The interface for our own members; also a react + redux single-page app
  (currently only in the `memberui` branch)
- **`nginx`** - An SSL-terminating reverse proxy for Kansa
- **`postgres`** - Configuration & schemas for our database

[Kansa](https://en.wiktionary.org/wiki/kansa#Finnish) is Finnish for "people" or "tribe", and it's
the name for our member registry.


### Installation & Configuration

To get a dev environment up and running, first clone this repo with `git clone --recursive`, or run
`git submodule update --init` after cloning. The database and server are set up to be run using
[docker-compose](https://docs.docker.com/compose/); for the Kansa importer & admin tools you'll need
a recent-ish version of node.

The particular places that may need manual adjustment are:

- Connections to the server require TLS (HTTPS, WSS); for ease of development the repo includes a
  [self-signed certificate](http://www.selfsignedcertificate.com/) for `localhost`. This will not
  be automatically accepted by browsers or other clients, and you'll need to convince them to get
  in. If you have a signed certificate you can use (and therefore a publicly visible address),
  you'll want to add the certificate files to `nginx/ssl/` and adjust the environment values set for
  the `nginx` service in [docker-compose.yml](docker-compose.yml).

- The `CORS_ORIGIN` variable in [kansa/server/dev.env](kansa/server/dev.env) needs to be a space- or
  comma-separated list of addresses at which client apps may be hosted, to allow for Cross-Origin
  Resource Sharing. By default, the value should match the `http://localhost:8080` address of the
  `kansa/admin` Webpack dev server started by `npm start` there.

- If you're running the server on a separate machine or if you've changed the `nginx` port
  configuration, you may need to tell `kansa/admin` where to find the server, using something like
  `export KANSA_API_HOST='remote.example.com'` before running `npm start`. The default is set
  [here](kansa/admin/webpack.config.js) to `localhost:4430'` or the address of your Docker VM.


### Login

As we're still missing a login flow, once you have all the services up and running, first visit
`https://localhost:4430/api/kansa/login?email=admin@example.com&key=key` (replacing `localhost` with
your Docker host address, if necessary) in your browser to login as the bootstrapped dev account;
that'll set a session cookie that'll enable the Kansa admin interface at `http://localhost:8080/` to
access the server. If/as your browser will complain about the server's self-singed certificate, you
will need to bypass its warnings:
- **Chrome**: Click on _Advanced_, then _Proceed to example.com_
- **Firefox**: Click on _I Understand the Risks_, then _Add Exception...._, then _Get Certificate_,
  and finally _Confirm Security Exception_
- **IE**: Click on _Continue to this website (not recommended)_
- **Safari**: Click on _Show Certificate_, _Always Trust "hostname" when connecting to "hostname"_,
  then _Continue_


----

If you'd like to help with this project, please get in touch with us at
[devops@worldcon.fi](mailto:devops@worldcon.fi).

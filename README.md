# Worldcon 75 Member Services [![DockerPulls](https://img.shields.io/docker/stars/worldcon75/api.svg)](https://hub.docker.com/r/worldcon75/api/)

This project is under active development, so not everything is ready yet. The main components are:

- **`docker-compose.yml`** - Service configuration
- **`hakkapeliitta`** - A deprecated Scala webshop implementation, due to be ported to node.js
- **`kansa/server`** - An express.js app providing [this API](https://docs.google.com/document/d/1N4R6jkSEpOc0oAfHK_xN2PtHWkepcKfsrpIR3f_IsAs/edit?usp=sharing)
- **`kansa/importer`** - A tool for importing CSV & JSON data from our prior registry format
- **`kansa/admin`** - An internal front-end for the registry data; a react + redux single-page app
- **`kansa/member`** - The interface for our own members; also a react + redux single-page app (currently only in the `memberui` branch)
- **`postgres`** - Configuration & schemas for our database

[Kansa](https://en.wiktionary.org/wiki/kansa#Finnish) is Finnish for "people" or "tribe", and it's
the name for our member registry.


### Installation & Configuration

To get a dev environment up and running, first clone this repo. The database and server are set up
to be run using [docker-compose](https://docs.docker.com/compose/); for the Kansa importer & admin
tools you'll need a recent-ish version of node.

The particular places that may need manual adjustment are:

- The `CORS_ORIGIN` variable in `kansa/server/dev.env` needs to be a space-separated list of
  addresses from which browser clients may connect to the server, to allow for Cross-Origin
  Resource Sharing. The defaule should match the default address for `kansa/admin`.
- To tell `kansa/admin` where to find the server, use something like `export
  KANSA_API_HOST='192.168.99.100:3000'` before running `npm start`; that's the default IP
  address that at least the Mac Docker Toolbox uses for its VM. The default is set
  [here](kansa/admin/webpack.config.js) to `localhost:3000`.


### Login

As we're still missing a login flow, once you have `postgres` + `kansa/server` + `kansa/admin` up
and running, first visit `http://localhost:3000/login?email=admin@example.com&key=key` (replacing
`localhost` with your Docker host address) in your browser to login as the bootstrapped dev account;
that'll set a session cookie that'll enable the Kansa admin interface at `http://localhost:8080/` to
access the server.


----

If you'd like to help with this project, please get in touch with us at
[devops@worldcon.fi](mailto:devops@worldcon.fi).

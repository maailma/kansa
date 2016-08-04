# Kansa

### A Worldcon member registry

This project is under active development, so not everything is ready yet. The main components are:

- **`postgres`** - Configuration & schemas for our database
- **`server`** - An express.js app providing [this API](https://docs.google.com/document/d/1N4R6jkSEpOc0oAfHK_xN2PtHWkepcKfsrpIR3f_IsAs/edit?usp=sharing)
- **`importer`** - A tool for importing CSV & JSON data from our prior registry format
- **`admin`** - An internal front-end for the registry data; a react + redux single-page app
- **`member`** - The interface for our own members; also a react + redux single-page app (currently only in the `memberui` branch)


### Installation & Configuration

To get a dev environment up and running, first clone this repo. The database and server are set up
to be run using [docker-compose](https://docs.docker.com/compose/); for the importer & admin tools
you'll need a recent-ish version of node.

The particular places that may need manual adjustment are:

- The `CORS_ORIGIN` variable in `kansa/server/dev.env` needs to be a space-separated list of
  addresses from which browser clients may connect to the server, to allow for Cross-Origin
  Resource Sharing. The defaule should match the admin tool's default address.
- To tell the admin tool where to find the server, use e.g. `export KANSA_API_HOST='192.168.99.100:3000'`
  before running `npm start`; that's the default IP Address that at least the Mac Docker Toolbox
  uses for its VM. The default is set [here](admin/webpack.config.js) to `localhost:3000`.


----

If you'd like to help with this project, please get in touch with us at
[devops@worldcon.fi](mailto:devops@worldcon.fi).

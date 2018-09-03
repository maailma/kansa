<div class="main-title">
<a class="badge" href="http://travis-ci.org/maailma/kansa">
<img align="right" src="https://api.travis-ci.org/maailma/kansa.svg?branch=master" alt="Build Status">
</a>
<h1>Kansa</h1>
</div>

Kansa is a convention member management system originally developed for [Worldcon 75](http://www.worldcon.fi),
the World Science Fiction Convention organised in Helsinki in 2017. It is also used by
[Dublin 2019: An Irish Worldcon](https://dublin2019.com/).

The system is modular and extensible. Together with its
[front-end client](https://github.com/maailma/kansa-client) it provides the following services:

- Member admin services, including an easy-to use admin front-end
- Support for multiple membership types, as well as for non-member accounts
- [Stripe](https://stripe.com/) integration for membership and other purchases (via credit cards or
  SEPA direct debit)
- Individual and bulk import of member data and transactions from other systems
- Member-facing front-end for e.g. name and address changes
- Passwordless authentication using login links sent by email
- Emails sent using [Sendgrid](https://sendgrid.com/) and customisable
  [templates](config/message-templates/)
- Synchronisation of contact info to Sendgrid for mass mailings

To help with at-con registration, Kansa has:

- Pre-con badge preview and customisation (with Unicode support)
- Printable/displayable barcodes for quick member identification
- Streamlined UI for registration staff, including on-demand badge printing
- Local caching that enables continued use even during network failures

Specifically of interest to Worldcons, Kansa also provides:

- **Hugo Awards** nomination and voting front-end for members
- Throttled/delayed email confirmations for nominators and voters
- Canonicalisation and category correction interface for Hugo admins
- Detailed reports on nomination and vote counts & results
- Secure hosting for the Hugo packet
- **Site Selection** token generator for online sales
- Member-specific Site Selection ballot PDF generator
- Token verification front-end for at-con Site Selection staff
- Custom data exports for matching member data for Site Selection purposes

Setting up and maintaining your own Kansa instance will require some experience with JavaScript and
PostgreSQL. The front-end is a React app, while most of the back-end services run on node.js; the
various parts are wrapped up in Docker containers. Work is ongoing to make the system more
configurable and customisable, so fewer changes in code are required for convention-specific changes.

### Getting Started

To get a dev environment up and running, first clone this repo. Then you'll need to have
[Docker Compose](https://docs.docker.com/compose/) available, as that's used by default for
container orchestration. To start, run `make start` or call `docker-compose` directly:

```
docker-compose \
  -f config/docker-compose.base.yaml -f config/docker-compose.dev.yaml \
  -p api up --build -d  # leave out the -d to not detach
```

Once you have all the services up and running, your development server should be available at
`https://localhost:4430/`, including a relatively recent front-end client (with code hosted under
GitHub Pages). You'll need to bypass your browser's complaint about the server's self-singed
certificate:

- **Chrome**: Click on _Advanced_, then _Proceed to localhost:4430_. Alternatively, go to
  `chrome://flags/#allow-insecure-localhost` and enable the option to "Allow invalid certificates
  for resources loaded from localhost"
- **Firefox**: Click on _I Understand the Risks_, then _Add Exception..._, then _Get
  Certificate_, and finally _Confirm Security Exception_
- **IE**: Click on _Continue to this website (not recommended)_
- **Safari**: Click on _Show Certificate_, _Always Trust "example.com" when connecting to
  "example.com"_, then _Continue_
- **`curl`**: Use the `-k` or `--insecure` flag to perform "insecure" SSL connections

The development server is bootstrapped with an admin account `admin@example.com` using the key
`key`, which you may login as by visiting either of the addresses
<https://localhost:4430/login/admin@example.com/key> (for smooth browser redicretion) or
<https://localhost:4430/api/login?email=admin@example.com&key=key> (direct login, with JSON response).

### Configuration

For production use and otherwise, the services' configuration is controlled by the Docker Compose
config files. For development use, run `make` in the project root to include the base config
[docker-compose.base.yaml](config/docker-compose.base.yaml) and the development config
[docker-compose.dev.yaml](config/docker-compose.dev.yaml). For production use, the base config will
instead need to be overridden by `docker-compose.prod.yaml`, which you will need to base on
[docker-compose.prod-template.yaml](config/docker-compose.prod-template.yaml) and fill with
appropriate variable values (see [`make prod`](Makefile)). Make sure that your production secrets
are **not** committed to any repository!

For the most part, services are configured using environment variables, some of which need to match
across services:

- `JWT_SECRET` and `SESSION_SECRET` allow the servers to share authenticated sessions
- `DATABASE_URL` and `*_PG_PASSWORD` are required for the services' database connections

Email messages are based on message templates, which are
[documented separately](config/message-templates/README.md).

### Directory Overview

- **`config`** - System configuration
- **`hugo`** - Provides the Hugo Nominations and Awards parts of the [REST API](docs/index.md)
- **`integration-tests`** - Tests for the REST API, targeting the Stripe and Sendgrid interfaces in particular
- **`kansa`** - Provides the core parts of the [REST API](docs/index.md)
- **`kyyhky`** - Internal mailing service & [SendGrid](https://sendgrid.com/) integration for hugo & kansa
- **`nginx`** - An SSL-terminating reverse proxy & file server, using [OpenResty](https://openresty.org/)
- **`postgres`** - Configuration & schemas for our database
- **`raami`** - Art show management [REST API](docs/raami.md)
- **`tools`** - Semi-automated tools for importing data, and for other tasks
- **`tuohi`** - Fills out a PDF form, for `GET /people/:id/ballot`

[Kansa](https://en.wiktionary.org/wiki/kansa#Finnish) is Finnish for "people" or "tribe", and it's
the name for our member registry. The [Hugo Awards](http://www.thehugoawards.org/) are awards that
are nominated and selected by the members of each year's Worldcon. Kyyhky is Finnish for "pigeon",
Raami is "frame", and Tuohi is the bark of a birch tree.

### Common Issues

The particular places that may need manual adjustment are:

- Connections to the server require TLS (HTTPS, WSS). For ease of development the repo includes a
  [self-signed certificate](http://www.selfsignedcertificate.com/) for `localhost`. This will not
  be automatically accepted by browsers or other clients. If you have a signed certificate you can
  use (and therefore a publicly visible address), you'll want to add the certificate files to
  `nginx/ssl/` and adjust the environment values set for the `nginx` service in
  [docker-compose.override.yaml](config/docker-compose.override.yaml) and/or your
  `docker-compose.prod.yaml`.

- The `CORS_ORIGIN` variables in the docker-compose config files need to be space-separated lists of
  addresses at which client apps may be hosted, to allow for Cross-Origin Resource Sharing. By
  default, the value should match the `http://localhost:8080` address of the client Webpack dev
  servers.

- If you're running the server on a separate machine or if you've changed the `nginx` port
  configuration, you may need to tell clients where to find the server, using something like
  `export API_HOST='remote.example.com'` before running `npm start`.

---

If you'd like to help with this project, please fell free to fork it and submit pull requests, or
get in touch with us at [kansa@maa-ilma.fi](mailto:kansa@maa-ilma.fi).

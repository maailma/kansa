# Kansa Client

These are the front-end clients for [Kansa](https://github.com/maailma/kansa), a convention member management system.

## Getting Started

Use `npm install` to fetch the required dependencies, and see [`package.json`](./package.json) for
the various `npm run` targets; the default `npm start` uses
[webpack-dev-server](https://github.com/webpack/webpack-dev-server#webpack-dev-server) to incrementally
re-build and serve the client code at `http://localhost:8080/` during development.

To use the client, you'll need a [Kansa](https://github.com/maailma/kansa) server that
you can connect to. In development, the server is assumed to run at its default local address
`https://localhost:4430/`; in production, the default is to use the same host that serves the
client code. To specify a different target, use the `API_HOST` environment variable:

The default dev-configured server provides an admin account with which you may log in by visiting:
<http://localhost:8080/#/login/admin@example.com/key>

```
API_HOST=members.worldcon.fi npm start
```

For other environment variables, see [`webpack.config.js`](./webpack.config.js). If you're running
Docker in a VM and have the `DOCKER_HOST` environment variable set, that will replace the default
`localhost` hostname.

**IMPORTANT**: As all server connections require https and the default development server uses a
self-signed certificate for `localhost`, you'll need to open it directly at `https://localhost:4430/`
to trigger your browser's functionality for bypassing the warning. Until you do that, your browser
will silently block the client's API calls:

  - **Chrome**: Click on _Advanced_, then _Proceed to localhost:4430_. Alternatively, go to
    `chrome://flags/#allow-insecure-localhost` and enable the option to "Allow invalid certificates
    for resources loaded from localhost"
  - **Firefox**: Click on _I Understand the Risks_, then _Add Exception...._, then _Get
    Certificate_, and finally _Confirm Security Exception_
  - **IE**: Click on _Continue to this website (not recommended)_
  - **Safari**: Click on _Show Certificate_, _Always Trust "example.com" when connecting to
    "example.com"_, then _Continue_

Also important: the API server by default self-hosts a client that uses the latest-release
production code hosted on GitHub Pages, so you should make sure that after bypassing the certificate
warning you navigate to your actual client development version, at `http://localhost:8080/`.

## Admin Interfaces

The Kansa and Hugo admin interfaces are built partly from the same sources as the public-facing site,
and are a part of the build targets specified in the Webpack config. Both of these require first
logging in using a login link. In dev mode:
- <https://localhost:4430/kansa-admin.html>
- <https://localhost:4430/hugo-admin.html>

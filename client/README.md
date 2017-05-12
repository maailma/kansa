# Worldcon 75 Member Services Client

These are the front-end clients for [members.worldcon.fi](https://members.worldcon.fi/),
implemented as single-page react + redux apps. For the back-end code, please see
[worldcon75/api](https://github.com/worldcon75/api).


### Getting Started

Use `npm install` to fetch the required dependencies, and see [`package.json`](./package.json) for
the various `npm run` targets; the default `npm start` uses
[webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html) to incrementally
re-build and serve the client code at `http://localhost:8080/` during development.

To use the client, you'll need a [worldcon75/api](https://github.com/worldcon75/api) server that
you can connect to. In development, the server is assumed to run at its default local address
`https://localhost:4430/`; in production, the default is to use the same host that server the
client code. To specify a different target, use the `API_HOST` environment variable:

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

  - **Chrome**: Click on _Advanced_, then _Proceed to example.com_
  - **Firefox**: Click on _I Understand the Risks_, then _Add Exception...._, then _Get
    Certificate_, and finally _Confirm Security Exception_
  - **IE**: Click on _Continue to this website (not recommended)_
  - **Safari**: Click on _Show Certificate_, _Always Trust "example.com" when connecting to
    "example.com"_, then _Continue_

Also important: the API server by default self-hosts a client that uses the latest-release
production code hosted on GitHub Pages, so you should make sure that after bypassing the certificate
warning you navigate to your actual client development version, at `http://localhost:8080/`.


### kansa-admin

 Currently, `kansa-admin` is set up to run completely separately from the main `client` interface.
 For development, both use the same server address `http://localhost:8080/` so the back-end CORS
 settings should not need to be updated and authentication cookies can be shared. To use it, it may
 be easier to login first using `client`, or by visiting the API endpoint
 `https://localhost:4430/api/login?email=admin@example.com&key=key` to set the proper auth cookie.

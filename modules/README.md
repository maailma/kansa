# Kansa Server Modules

The functionality of the core Kansa member management system is extended by
modules, which are loaded as Express.js router apps at a base path matching
their name.

To add/enable a module, it needs to be included in the `config/kansa.yaml`
configuration's `modules` section, and the module needs to be loadable by the
server from a path `/kansa/modules/${name}`. If the module has dependencies that
are not satisfied by the Kansa server's dependencies, those dependencies will
need to be installed -- see the server's `Dockerfile` for an example.

To disable a module's API endpoints, set its configuration to a falsy value.
This configuration will also be visible to the client. Do note that changes in
configuration require a server restart to be applied.

For modules that need database setup you'll need to handle that separately.

The [actual code](../server/app.js) that loads a module looks like this:

```js
Object.keys(config.modules).forEach(name => {
  const mc = config.modules[name]
  if (mc) {
    const mp = path.resolve(__dirname, 'modules', name)
    const module = require(mp)
    app.use(`/${name}`, module(db, mc))
  }
})
```

Here `db` is the default `pg-promise` database instance. To create an instance
with different connection options, you may use `db.$config.pgp(url)`.

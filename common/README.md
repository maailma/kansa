# @kansa/common

Common objects and utilities shared across the
[Kansa](https://github.com/maailma/kansa) server & modules.

## User authentication

```js
const { isSignedIn, hasRole, matchesId } = require('@kansa/common/auth-user')
```

### `function isSignedIn(req, res, next)`

Express.js middleware function that verifies that the current user is signed in.
On failure, calls `next(new AuthError())`.

### `function hasRole(role: string | string[]): function(req, res, next)`

Function returning an Express.js middleware function that verifies that the
current user is signed in and has the specified `role` (or one of the roles, if
an array). On failure, calls `next(new AuthError())`.

### `function matchesId(db, req, role?: string | string[]): Promise<number>`

Verifies that the `id` parameter of the request `req` grants access to the
session user's `email`. If set, `role` may define one or multiple roles that the
user may have that grant access without a matching `email`.

`db` should be a `pg-promise` instance, or e.g. a `task` extended from such an
instance. Returns a promise that either resolves to the `id` value, or rejects
with either `AuthError`, `InputError`, or a database error.

### `new AuthError(message: string)`

## Configuration

```js
const config = require('@kansa/common/config')
```

The server configuration, sourced from `config/kansa.yaml` and read during
server start.

## Errors

```js
const { AuthError, InputError } = require('@kansa/common/errors')
```

### `new AuthError(message: string)`

### `new InputError(message: string)`

Handled by the server's error handling. May also have their `status` set.

## Mail

### `function sendMail(type: string, data: any, delay?: number): Promise`

Schedule an email message of `type` with `data` to be sent, with an optional
`delay` in minutes. The message should have a correspondingly named template
available under `config/message-templates/`.

### `function updateMailRecipient(db, email: string): Promise`

Using the `pg-promise` instance `db`, fetch the appropriate data for `email`
and forward it to be sent to Sendgrid. Returns a promise that will never reject.

## Split names

```js
const splitName = require('@kansa/common/split-name')

splitName('Bob Tucker')
// ['', 'Bob Tucker']

splitName('Bob Tucker', 8)
// ['Bob', 'Tucker']

splitName('Arthur Wilson "Bob" Tucker')
// [ 'Arthur Wilson', '"Bob" Tucker' ]
```

### `function splitName(name: string, maxLength = 14): [string, string]`

Splits a name (or other string) prettily on two lines.

If the name already includes newlines, the first will be used to split the
string and the others replaced with spaces. If the name is at most
`maxLength` characters, it'll be returned as `['', name]`. Otherwise, we
find the most balanced white space to use as a split point.

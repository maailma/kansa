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

## Errors

```js
const { AuthError, InputError, NotFoundError } = require('@kansa/common/errors')
```

### `new AuthError(message: string)`

### `new InputError(message: string)`

### `new NotFoundError(message: string)`

Handled by the server's error handling. May also have their `status` set.

## Log entries

```js
const LogEntry = require('@kansa/common/log-entry')
new LogEntry(req, 'Log message').write(db)
```

### `new LogEntry(req, message: string)`

Creates a new log entry for tracking changes. The entry's fields such as
`author`, `description` and `subject` are modifiable before the entry gets
stored with its `write(db): Promise` method.

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

## Trueish

```js
const isTrueish = require('@kansa/common/trueish')

isTrueish() // false
isTrueish('0') // false
isTrueish(' False') // false
isTrueish(-1) // true
```

### `function isTrueish(v: any): boolean`

Casts input into boolean values. In addition to normal JavaScript casting
rules, also trims and lower-cases strings before comparing them to the
following: `''`, `'0'`, `'false'`, `'null'`. Matches to these result in a
`false` value. The primary intent is to enable human-friendly handling of query
parameter values.

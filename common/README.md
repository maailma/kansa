# `@kansa/common`

Common objects and utilities shared across the Kansa server & modules

## `@kansa/common/errors`

### `new AuthError(message: string)`

### `new InputError(message: string)`

Handled by the server's error handling. May also have their `status` set.

## `@kansa/common/split-name`

### `function splitName(name: string, maxLength = 14): [string, string]`

Splits a name (or other string) prettily on two lines.

If the name already includes newlines, the first will be used to split the
string and the others replaced with spaces. If the name is at most
`maxLength` characters, it'll be returned as `['', name]`. Otherwise, we
find the most balanced white space to use as a split point.

```js
const splitName = require('@kansa/common/split-name')

splitName('Bob Tucker')
// ['', 'Bob Tucker']

splitName('Bob Tucker', 8)
// ['Bob', 'Tucker']

splitName('Arthur Wilson "Bob" Tucker')
// [ 'Arthur Wilson', '"Bob" Tucker' ]
```

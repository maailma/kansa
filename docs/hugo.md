# Hugo API

- [Hugo Nominations](#hugo-nominations)
  - [`GET hugo/:id/nominations`](#get-hugoidnominations)
  - [`POST hugo/:id/nominate`](#post-hugoidnominate)
- [Hugo Votes](#hugo-votes)
  - [`GET /hugo/finalists`](#get-hugofinalists)
  - [`GET /hugo/:id/packet`](#get-hugoidpacket)
  - [`GET /hugo/:id/votes`](#get-hugoidvotes)
  - [`POST /hugo/:id/vote`](#post-hugoidvote)
- [Hugo Admin](#hugo-admin)
  - [`GET hugo/admin/ballots`](#get-hugoadminballots)
  - [`GET hugo/admin/ballots/:category`](#get-hugoadminballotscategory)
  - [`GET hugo/admin/canon`](#get-hugoadmincanon)
  - [`POST hugo/admin/canon/:id`](#post-hugoadmincanonid)
  - [WebSocket: `hugo/admin/canon-updates`](#websocket-hugoadmincanonupdates)
  - [`POST hugo/admin/classify`](#post-hugoadminclassify)
  - [`GET hugo/admin/nominations`](#get-hugoadminnominations)

---

## Hugo Nominations

### `GET hugo/:id/nominations`

- Requires authentication
- Parameter: `all`

Find the Hugo nominations for the person matching `id`. If its email address
does not match the session data, `hugo_admin` authority is required. The results
are sorted first by award category, then in descending order of submission time;
if the `all` parameter is not set, each category only includes its most recent
nomination.

#### Response

```
[
  {
    "id": 4,
    "time": "2016-08-13T17:45:24.773Z",
    "client_ip": "::ffff:172.19.0.5",
    "client_ua": "curl/7.43.0",
    "person_id": 1,
    "category": "Novel",
    "nominations": [
      {
        "author": …,
        "title": …,
        "publisher": …
      },
      {
        "author": …,
        "title": …,
        "publisher": …
      },
      …
    ]
  },
  {
    "id": 5,
    "time": "2016-08-13T17:51:23.323Z",
    "client_ip": "::ffff:172.19.0.5",
    "client_ua": "curl/7.43.0",
    "person_id": 1,
    "category": "Novella",
    "nominations": [
      {
        "author": …,
        "title": …,
        "publisher": …
      },
      {
        "author": …,
        "title": …,
        "publisher": …
      },
      …
    ]
  },
  …
]
```

### `POST hugo/:id/nominate`

- Requires authentication
- Parameters: `signature`, `category`, `nominations`

Find the Hugo nominations for the person matching `id`. If its email address
does not match the session data, `hugo_admin` authority is required. `signature`
needs to be a non-empty string. `category` needs to be string matching one of
the award categories included [here](postgres/init/30-hugo-init.sql).
`nominations` must be a JSON array of objects.

#### Response

```
{
  "status": "success",
  "time": "2016-08-13T17:24:59.746Z",
  "client_ip": "::ffff:172.19.0.5",
  "client_ua": "curl/7.43.0",
  "person_id": 1,
  "signature": "…",
  "category": "Novella",
  "nominations": [
    {
      "author": …,
      "title": …,
      "publisher": …
    },
    {
      "author": …,
      "title": …,
      "publisher": …
    },
    …
  ]
}
```

## Hugo Admin

### `GET hugo/admin/ballots`

- Requires authentication and `hugo_admin` authority

Fetch all current uncanonicalised ballots. Results are sorted by category, and
expressed as `[ id, array ]` tuples where ballots with the same `id` in
different categories are from the same nominator.

#### Response

```
{
  Fancast: [
    [ 24, [ { title: 'Three Little Piggies' }, … ] ],
    [ 42, [ { title: 'The Really Good One' }, { title: '3 pigs' }, … ] ],
    …
  ],
  Novel: {
    [ 42, [ { author: 'Asimov', title: '1984' }, … ] ],
    …
  },
  …
}
```

### `GET hugo/admin/ballots/:category`

- Requires authentication and `hugo_admin` authority

Fetch the current uncanonicalised ballots for `category`. Results are expressed
as `[ id, array ]` tuples where ballots with the same `id` in different
categories are from the same nominator.

#### Response

```
[
  [ 24, [ { title: 'Three Little Piggies' }, … ] ],
  [ 42, [ { title: 'The Really Good One' }, { title: '3 pigs' }, … ] ],
  …
]
```

### `GET hugo/admin/canon`

- Requires authentication and `hugo_admin` authority

Fetch the set of canonical nominations. Results are sorted by category, and
expressed as `{ id, data, disqualified, relocated }` objects.

#### Response

```
{
  Fancast: [
    { id: 2, data: { title: 'The Really Good One' }, disqualified: false },
    { id: 3, data: { title: 'Three Little Piggies' }, disqualified: true  }
  ],
  Novella: [
    { id: 6, data: { author: 'Asimov', title: '1984' },
      disqualified: false, relocated: 'Novel' }
  ],
  …
}
```

### `POST hugo/admin/canon/:id`

- Requires authentication and `hugo_admin` authority
- Parameters: `category` (required), `nomination` (required), `disqualified`, `relocated`

Sets all the fields for the canonical nomination `id`.

#### Response

```
{ status: 'success' }
```

### `GET hugo/admin/nominations`

- Requires authentication and `hugo_admin` authority

Fetch all unique nomination entries. Results are sorted by category, and
expressed as `[ object, id ]` tuples, where the second entry is the id of the
nomination's canonical form, if such has been assigned.

#### Response

```
{
  Novel: [
    [ { title: 'best', author: 'the' } ],
    [ { title: 'Work of Art', author: 'The best' }, 6 ]
  ],
  Fancast: [
    [ { title: '3 pigs' }, 3 ],
    [ { title: 'The Really Good One' }, 2 ],
    [ { title: 'Three Little Piggies' }, 3 ]
  ],
  …
}
```

### `POST hugo/admin/classify`

- Requires authentication and `hugo_admin` authority
- Parameters: `category` (required), `nominations` (required), `canon_id`, `canon_nom`

Classify the given `nominations` in `category` as having the canonicalisation
identified by `canon_id` or (if set) `canon_nom`. If both are falsey, the nominations'
canonicalisations are removed.

#### Request

```
{
  category: 'Fancast',
  nominations: [
    { title: '3 pigs' },
    { title: 'Three Little Piggies' }
  ],
  canon_nom: { title: 'Three Little Piggies' }
}
```

#### Response

```
{ status: 'success' }
```

### WebSocket: `hugo/admin/canon-updates`

- Requires authentication and `hugo_admin` authority

WebSocket connection endpoint. The server won't listen to any messages sent to
it, but will broadcast updates to `canon` and `classification` tables as they happen.
Each message will contain as its data a JSON string representation of a single update.

The API uses the app-specific codes `4001` and `4004` on WebSocket `'close'`
events to signal `'Unauthorized'` and `'Not Found'` (respectively) to the client.

#### Response

```
'{"canon":{"id":13,"category":"Novel","nomination":{"author":"That Guy","title":"That Book"},"disqualified":false}}'
'{"classification":{"nomination":{"author": "A friend"},"category":"Novel","canon_id":13}}'
…
```

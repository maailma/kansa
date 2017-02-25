# Member Services API

Some GET paths include query parameters. POST body parameters may be included
either as `application/x-www-form-urlencoded` or as `application/json`. All
server responses will be formatted as JSON.

In cases of error, the HTTP status code will be `400` or `401` for client error,
and `500` for server error. The response should contain a `status` field with
the contents `"error"` or `"unauthorized"`, as appropriate, possibly along with
some relevant data and/or a `message` field.

* [Public information](#public-information)
  * [`GET /api/kansa/public/people`](#get-apikansapublicpeople)
  * [`GET /api/kansa/public/stats`](#get-apikansapublicstats)
* [Authentication](#authentication)
  * [`POST /api/kansa/key`](#post-apikansakey)
  * [`GET/POST /api/kansa/login`](#getpost-apikansalogin)
  * [`GET/POST /api/kansa/logout`](#getpost-apikansalogout)
* [User info](#user-info)
  * [`GET /api/kansa/user`](#get-apikansauser)
  * [`GET /api/kansa/user/log`](#get-apikansauserlog)
* [Member info](#member-info)
  * [`GET /api/kansa/people`](#get-apikansapeople)
  * [`POST /api/kansa/people`](#post-apikansapeople)
  * [`GET /api/kansa/people/:id`](#get-apikansapeopleid)
  * [`GET /api/kansa/people/:id/log`](#get-apikansapeopleidlog)
  * [`POST /api/kansa/people/:id`](#post-apikansapeopleid)
  * [`POST /api/kansa/people/:id/upgrade`](#post-apikansapeopleidupgrade)
  * [WebSocket: `wss://server/api/kansa/people/updates`](#websocket-wssserverapikansapeopleupdates)
* [Purchases](#purchases)
  * [`POST /api/kansa/purchase`](#post-apikansapurchase)
  * [`GET /api/kansa/purchase/prices`](#get-apikansapurchaseprices)
* [Hugo Nominations](#hugo-nominations)
  * [`GET /api/hugo/:id/nominations`](#get-apihugoidnominations)
  * [`POST /api/hugo/:id/nominate`](#post-apihugoidnominate)
* [Hugo Admin](#hugo-admin)
  * [`GET /api/hugo/admin/ballots`](#get-apihugoadminballots)
  * [`GET /api/hugo/admin/ballots/:category`](#get-apihugoadminballotscategory)
  * [`GET /api/hugo/admin/canon`](#get-apihugoadmincanon)
  * [`POST /api/hugo/admin/canon/:id`](#post-apihugoadmincanonid)
  * [WebSocket: `wss://server/api/hugo/admin/canon-updates`](#websocket-wssserverapihugoadmincanonupdates)
* [Raami exhibitions](#raami)
  * [`POST /api/hugo/admin/classify`](#post-apihugoadminclassify)
  * [`GET /api/hugo/admin/nominations`](#get-apihugoadminnominations)
  * [WebSocket: `wss://server/api/hugo/admin/canon-updates`](#websocket-wssserverapihugoadmincanon-updates)

----

## Public information

### `GET /api/kansa/public/people`
List of members who have opted to have their info in public

#### Response
```
[
  { country, membership, public_name },
  …
]
```


### `GET /api/kansa/public/stats`
Membership statistics by country

#### Response
```
{
	Finland: { Adult: 13, …, total: 26 },
	…,
	'': { Adult: 131, …, total: 262 }
}
```

## Authentication

### `POST /api/kansa/key`
- Parameters: `email`

If `email` matches at least one known person (case-insensitively):
1. Generate and store a `key`
2. Send a message to the given `email` address with a login link

#### Response
```
{
  status: 'success',
  email: {
    to: 'bob@example.com',
    from: 'registration@worldcon.fi',
    fromname: 'Worldcon 75 Registration',
    subject: 'Worldcon 75 Access Key'
  }
}
```


### `GET/POST /api/kansa/login`
- Parameters: `email`, `key`

If the pair `key`, `email` matches known values, create a new session object

#### Response
```
Set-Cookie: w75=sessionId

{
	status: 'success',
	email
}
```


### `GET/POST /api/kansa/logout`
- Requires authentication
- Parameters: `all`, `reset`, `email` (`admin_admin` only)

Removes the user information from the current session. If `email` is set in the
parameters, the session user needs `admin_admin` authority; otherwise it's read
from session data. If `all` is set, all of the user's sessions are terminated.
If `reset` is set, the user's key is also reset, and will need to be
re-requested.

#### Response
```
{
	status: 'success',
	email,
	opt: undefined | 'all' | 'reset',
	sessions: undefined | #
}
```


## User info

### `GET /api/kansa/user`
- Requires authentication
- Parameters: `email` (`member_admin` only)

If `email` is not set, its value is read from session data. Returns the
memberships matching the given email address, and the roles (e.g.
`"member_admin"`) assigned to this email address.

#### Response
```
{
	email,
  people: [ { id, membership, legal_name, … }, … ],
	roles: [ … ]
}
```


### `GET /api/kansa/user/log`
- Requires authentication
- Parameters: `email` (`member_admin` only)

If `email` is not set, its value is read from session data. Returns the
log entries with `author` set to the given email address.

#### Response
```
{
	email,
  log: [ … ]
}
```


## Member info

### `GET /api/kansa/people`
- Requires authentication and `member_admin` authority
- Parameters: `since`, `name`, and all person fields

List member data. If no query parameters are present, the response array
contains all members and is padded with `null` values such that
`response[id].id == id`, and fields with `null` or `false` values are left out
of the response.

`since` will return entries with a `last_modified` value (ISO 8601 date) greater
than specified. `name` is shorthand for searching among all three name fields.
All text fields are compared using the postgres case-insensitive `ILIKE`, which
uses `_` for single-character wildcards and `%` for multiple characters.

#### Response
```
[
  { id, last_modified, member_number, legal_name, email, … },
  …
]
```


### `POST /api/kansa/people`
- Requires authentication and `member_admin` authority
- Parameters: `membership`, `legal_name`, `email`, `public_first_name`,
  `public_last_name`, `city`, `state`, `country`, `paper_pubs`

Add new person. If `membership` is not `'NonMember'`, a new `member_number` will
be generated.

#### Response
```
{
	status: 'success',
	id
}
```


### `GET /api/kansa/people/:id`
- Requires authentication

Find the person matching `id`. If its email address does not match the session
data, `member_admin` authority is required.

#### Response
```
{
  id, last_modified, member_number, membership, legal_name, email,
  public_first_name, public_last_name, city, state, country,
  can_hugo_nominate, can_hugo_vote, can_site_select,
  paper_pubs: { name, address, country }
}
```


### `GET /api/kansa/people/:id/log`
- Requires authentication

Find the log entries for the person matching `id`. If its email address does not
match the session data, `member_admin` authority is required.

#### Response
```
[
	{ timestamp: …, author: …, subject: …, action: …, … },
	…
]
```


### `POST /api/kansa/people/:id`
- Requires authentication
- Parameters: `membership` (`member_admin` only), `email` (`member_admin` only),
  `legal_name`, `public_first_name`, `public_last_name`, `city`, `state`,
  `country`, `paper_pubs`

Update the data for the person matching `id`. If its email address does not
match the session data, `member_admin` authority is required.

If set, the `paper_pubs` value is required to be a JSON object with non-empty
values for the fields `name`, `address`, and `country`. If the user does not
`member_admin` authority, it also needs to have been previously set to a
non-null value.

#### Response
```
{
	status: 'success',
	updated: [ 'legal_name', … ]
}
```


### `POST /api/kansa/people/:id/upgrade`
- Requires authentication and `member_admin` authority
- Parameters: `membership`, `member_number` (`admin_admin` only), `paper_pubs`

Increase membership level, generating a `member_number` if not set in parameters
or previously set. Also handles `paper_pubs` purchases, connected or separately
from membership changes.

#### Response
```
{
  status: 'success',
  updated: [ 'membership', 'member_number', 'paper_pubs' ]
}
```


### WebSocket: `wss://server/api/kansa/people/updates`
- Requires authentication and `member_admin` authority

WebSocket connection endpoint. The server won't listen to any messages sent to
it, but will broadcast updates to People as they happen. Each message will
contain as its data a JSON string representation of a single updated person.

The API uses the app-specific codes `4001` and `4004` on WebSocket `'close'`
events to signal `'Unauthorized'` and `'Not Found'` (respectively) to the client.

#### Response
```
'{"id":#,"member_number":…,"legal_name":…,…}'
```


## Purchases

### `POST /api/kansa/purchase`
- Parameters: `amount`, `email`, `token`,
  `new_members: [ { membership, email, legal_name, public_first_name, public_last_name, city, state, country, paper_pubs }, ... ]`,
  `upgrades: [ { id, membership, paper_pubs }, ... ]`

Using the `token` received from Stripe, make a charge of `amount` on the card
(once verified against the server-side calculated sum from the items) and add
the `new_members` to the database as well as applying the specified `upgrades`.
For new members, generate a login key and include it in the welcome email sent
to each address. Send the receipt of the purchase to the `email` address.

#### Response
```
{
  status: 'success',
  emails: ['address@example.com', ...]
}
```

### `GET /api/kansa/purchase/prices`

Current membership and paper publications prices, with `amount` in EUR cents.

#### Response
```
{
  memberships: {
    Supporter: { amount: 3500, description: 'Supporting' },
    ...,
    Adult: { amount: 12000, description: 'Adult' },
  },
  PaperPubs: { amount: 1000, description: 'Paper publications' }
}
```


## Hugo Nominations

### `GET /api/hugo/:id/nominations`
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


### `POST /api/hugo/:id/nominate`
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

### `GET /api/hugo/admin/ballots`
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


### `GET /api/hugo/admin/ballots/:category`
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


### `GET /api/hugo/admin/canon`
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


### `POST /api/hugo/admin/canon/:id`
- Requires authentication and `hugo_admin` authority
- Parameters: `category` (required), `nomination` (required), `disqualified`, `relocated`

Sets all the fields for the canonical nomination `id`.

#### Response
```
{ status: 'success' }
```


### `GET /api/hugo/admin/nominations`
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


### `POST /api/hugo/admin/classify`
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


### WebSocket: `wss://server/api/hugo/admin/canon-updates`
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


## Raami exhibition

### `GET /api/raami/artists`

List of members who have opted to participate in the art exhibition

#### Response
```
[
  { person\_id: 'person_id',
    continent: 'Europe',
    }
  …
]
```

### `GET /api/raami/artists/:id`

- Parameters: `id` (required)

Full details for singular artist.

#### Response
```
  { continent: 'Europe',
    url: 'http://www.example.com',
    filename: 'portfolio.pdf',
    portfolio: [bytes],
    category: 'Cover artist',
    orientation: 'Fantasy',
    description: 'Who is the artist etc.',
    trasnport: 'Air mail' 
    }
  …
```

### `POST /api/raami/artist`

- Parameters: `person_id`, `continent`, `url`, `filename`, `portfolio`, `category`, `orientation`, `description`, `transport`

Insert new artist's details.

#### Response
```
{
  status: 'success',
  inserted: [ 'id', 'continent', 'url','filename', 'portfolio', 'category', 'orientation', 'description', 'transport' ]
}
```

### `PUT /api/raami/artist/:id`

- Parameters: `id` (required), `continent`, `url`, `filename`, `portfolio`, `category`, `orientation`, `description`, `transport`

Update new artist's details.

#### Response
```
{
  status: 'success',
  updated: [ 'id', 'continent', 'url', 'filename', 'portfolio', 'category', 'orientation', 'description', 'transport' ]
}
```

### `GET /api/raami/works/:id`

- Parameters: `id` (required) artists id

Ids of works for particular artists

#### Response
```
[
  { id: 1 },
  …
]
```


### `GET /api/raami/work/:id`

- Parameters: `id` (required) work id

Full details for singular work.

#### Response
```
[
  { artist_id: 1,
    title: 'Book cover',
    width: 10.0,
    height: 10.0,
    technique: 'Oil on canvas',
    graduation: 0,
    filename: 'file.jpg',
    image: bytes,
    price: 100.0
    }
  …
]
```

### `POST /api/raami/work`

- Parameters: `artist_id`, `title`, `width`, `height`, `technique`, `graduation`, `filename`, `image`, `price`

Insert new works's details.

#### Response
```
{
  status: 'success',
  inserted: [ 'artist_id', 'title', 'width', 'height', 'technique', 'graduation', 'filename', 'image', 'price' ]
}
```

### `PUT /api/raami/work/:id`

- Parameters: `id`, `artist_id`, `title`, `width`, `height`, `technique`, `graduation`, `filename`, `image`, `price`

Update works's details.

#### Response
```
{
  status: 'success',
  updated: [ 'id', 'artist_id', 'title', 'width', 'height', 'technique', 'graduation', 'filename', 'image', 'price' ]
}
```

### `DELETE /api/raami/work/:id`

- Patameters: `id` (required)

#### Response
```
{
  status: 'success',
  deleted: [ `id` ]
}
```

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
  * [`POST /api/kansa/people/lookup`](#post-apikansapeoplelookup)
  * [WebSocket: `wss://server/api/kansa/people/updates`](#websocket-wssserverapikansapeopleupdates)
* [Purchases](#purchases)
  * [`POST /api/kansa/purchase`](#post-apikansapurchase)
  * [`GET /api/kansa/purchase/data`](#get-apikansapurchasedata)
  * [`GET /api/kansa/purchase/list`](#get-apikansapurchaselist)
  * [`POST /api/kansa/purchase/other`](#post-apikansapurchaseother)
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
  * [`POST /api/hugo/admin/classify`](#post-apihugoadminclassify)
  * [`GET /api/hugo/admin/nominations`](#get-apihugoadminnominations)
* [Raami exhibitions](#raami)

----

## Public information

### `GET /api/kansa/public/people`
- Parameters: `csv`

List of members who have opted to have their info in public. If the query
parameter `csv` is true-ish, returns results as csv rather than json format.

#### Response
```
[
  { country, membership, first_name, last_name },
  …
]
```


### `GET /api/kansa/public/stats`
- Parameters: `csv`

Membership statistics by country. If the query parameter `csv` is true-ish,
returns results as csv rather than json format.

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
- Parameters: `email`, `reset`

If `email` matches (case-insensitively) a known address, send a login link to
that address. If no key exists or `reset` is true-ish, generate a new key.

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
- Requires authentication and `member_admin` or `member_list` authority
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
  id,
  member_number
}
```


### `GET /api/kansa/people/:id`
- Requires authentication

Find the person matching `id`. If its email address does not match the session
data, `member_admin` or `member_list` authority is required.

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
match the session data, `member_admin` or `member_list` authority is required.

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
  member_number,
  updated: [ 'membership', 'member_number', 'paper_pubs' ]
}
```


### `POST /api/kansa/people/lookup`
- Parameters: `email`, `member_number`, `name`

Finds a person's `id`, `membership` and `name` based on a slightly fuzzy lookup
given some subset of the parameters `email`, `member_number`, and `name`. If the
lookup matches more than one hit, `status` will be `multiple`. If no matches are
found, `status` will be `not found`. Child and Kid-in-tow members are not
included in the results.

#### Response
```
{
  status: 'success',
	id,
  membership,
  name
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
to each address. Sends an info message to each new or upgraded member.

#### Response
```
{
  status: 'success',
  charge_id
}
```

### `GET /api/kansa/purchase/data`

Current purchase data for non-membership purchases. Top-level keys correspond to
pre-defined payment categories and their `types`. `shape` values define the
shapes of the expected `data` object, with matching JS `type`. The
`{ [key]: label }` object `values` of `shape` defines select/radio options. Keys
of `shape` with `required: true` need to have a non-empty value in the matching
request.

#### Response
```
{
  Sponsorship: {
    shape: {
      sponsor: {
        label: 'Sponsor name',
        required: true,
        type: 'string'
      }
    },
    types: [{ key: 'bench', amount: 20000, label: 'Sponsored bench' }, ...]
  },
  ...
}
```

### `GET /api/kansa/purchase/list`

Purchases made using this account's `email` address, or one set as a query
parameter (requires `member_admin` access).

#### Response
```
[
  {
    id: 123,
    timestamp: '2017-03-24 06:49:57.229836+00',
    amount: 200000,
    currency: 'eur',
    stripe_charge_id: '...',
    category: 'Sponsorship',
    type: 'bench',
    payment_email: '...',
    person_id: 456,
    person_name: '...',
    data: { sponsor: '...' },
    comments: '...',
    invoice: '456'
  },
  ...
]
```

### `POST /api/kansa/purchase/other`
Parameters:
- `token: { id, email }`: Received from Stripe, used to make the charge
- `items`: Array of payment objects, each consisting of:
  - `amount`, `currency`: The charge amount, in integer cents of `currency`
  - `person_id`, `person_name`: The beneficiary of the payment (optional)
  - `category`, `type`, `data`: Required to match entries returned by
    [`GET /api/kansa/purchase/data`](#get-apikansapurchasedata)
  - `comments`, `invoice`: Optional strings

Using the `token` received from Stripe, make a charge on the card and adds
entries to the `Payments` table for each item. Sends an info email to each
item's beneficiary.

#### Request
```
{
  token: { id: '...', email: '...' },
  items: [
    {
      amount: 200000,
      currency: 'eur',
      category: 'Sponsorship',
      type: 'bench',
      data: { sponsor: '...' },
      person_id: 123,
      person_name: '...',
      comments: '...',
      invoice: '456'
    }
  ]
}
```

#### Response
```
{
  status: 'success',
  charge_id: '...'
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


## Raami Arts Show Exhibitions

<!-- router.get('/:id/artist', db.getArtist);
router.post('/:id/artist', db.upsertArtist);
router.get('/:id/works', db.getWorks);
router.put('/:id/works', db.createWork);
router.post('/:id/works/:work', db.updateWork);
router.delete('/:id/works/:work', db.removeWork);
 -->

```

### `GET /api/raami/:id/artist/`

- Requires authentication
- Parameters: `id` (required)

Full details for singular artist connected to member with `id`.

#### Response
```
<<<<<<< HEAD
  { continent: 'Europe',
    url: 'http://www.example.com',
    filename: 'portfolio.pdf',
    portfolio: [bytes],
    category: 'Cover artist',
    orientation: 'Fantasy',
    description: 'Who is the artist etc.',
    transport: 'Air mail'
    }
  …
```
=======
>>>>>>> daddb57... raami api up to date

{people_id:1, title:'title', width:10, height:10, depth:10, gallery:'Print',
        orientation:'vertical', technique:'3D', filename:'image.jpg', filedata:'base64...', year:2016, price:100,
        … }
```

### `POST /api/raami/:id/artist`

- Requires authentication
- Parameters: `id` (required)
- Parameters: `people_id`, `name`, `continent`, `url`, `filename`, `filedata`, `category`, `description`, `transport`, `auction`, `print`, `digital`, `legal`, `agent`, `contact`, `waitlist`, `postage`

Update or insert artist's details for this member.

#### Response
```
{
  status: 'success',
  people_id: 1
}
```


### `GET /api/raami/:id/works`

- Requires authentication
- Parameters: `id` (required) artists id

Get details for works by artist with this member id.

#### Response
```
[
  {id:999, people:id: 1, title:'text', width: 10, height: 10, depth: 10… }
  …
]
```


### `GET /api/raami/:id/work/:work`

- Requires authentication
- Parameters: `id` (required) member id, `work` (required) work id

Full details for singular work.

#### Response
```
  {id:999, people:id: 1, title:'text', width: 10, height: 10, depth: 10… }

```

### `POST /api/raami/:id/work`

- Requires authentication
- Parameters: `people_id` as id (required) , `title`, `width`, `height`, `depth`, `gallery`,`orientation`, `technique`, `filename`, `filedata`, `year`, `price`

Insert works's details for this member id.

#### Response
```
{
  status: 'success',
  inserted: [ 'artist_id', 'title', 'width', 'height', 'technique', 'graduation', 'filename', 'image', 'price' ]
}
```

### `PUT /api/raami/:id/work/:work`

- Requires authentication
- Parameters: `work`(required) as `id` , `id` (required) as `people_id`, `title`, `width`, `height`, `depth`, `gallery`,`orientation`, `technique`, `filename`, `filedata`, `year`, `price`

Update works's details.

#### Response
```
{
  status: 'success',
}
```

### `DELETE /api/raami/:id/work/:work`

- Requires authentication
- Patameters: `id` (required), `work` (required)

Remove this work from artist's works with id.

#### Response
```
{
  status: 'success',
  deleted: [ `id` ]
}
```

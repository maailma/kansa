# Member Services API

All API requests need to be made using secure connections, i.e. with `https` or
`wss` protocols, and their paths should be prefixed by `/api/`. Requests for
`/api/hugo/...` will be handled by the [`hugo`](../hugo/) server,
`/api/raami/...` by [`raami`](../raami/), and all others by [`kansa`](../kansa/).

Some GET paths include query parameters. POST body parameters may be included
either as `application/x-www-form-urlencoded` or as `application/json`. All
server responses will be formatted as JSON.

In cases of error, the HTTP status code will be `400` or `401` for client error,
and `500` for server error. The response should contain a `status` field with
the contents `"error"` or `"unauthorized"`, as appropriate, possibly along with
some relevant data and/or a `message` field.

* [Public information](#public-information)
  * [`GET public/people`](#get-publicpeople)
  * [`GET public/stats`](#get-publicstats)
* [Authentication](#authentication)
  * [`POST key`](#post-key)
  * [`GET/POST login`](#getpost-login)
  * [`GET/POST logout`](#getpost-logout)
* [User info](#user-info)
  * [`GET user`](#get-user)
  * [`GET user/log`](#get-userlog)
* [Member info](#member-info)
  * [`GET people`](#get-people)
  * [`POST people`](#post-people)
  * [`GET people/:id`](#get-peopleid)
  * [`GET people/:id/log`](#get-peopleidlog)
  * [`POST people/:id`](#post-peopleid)
  * [`POST people/:id/upgrade`](#post-peopleidupgrade)
  * [`POST people/lookup`](#post-peoplelookup)
  * [WebSocket: `people/updates`](#websocket-peopleupdates)
* [Purchases](#purchases)
  * [`POST purchase`](#post-purchase)
  * [`GET purchase/data`](#get-purchasedata)
  * [`GET purchase/keys`](#get-purchasekeys)
  * [`GET purchase/list`](#get-purchaselist)
  * [`POST purchase/other`](#post-purchaseother)
  * [`GET purchase/prices`](#get-purchaseprices)
* [Slack](#slack)
  * [`POST slack/invite`](#post-slackinvite)
* [Hugo Nominations](#hugo-nominations)
  * [`GET hugo/:id/nominations`](#get-hugoidnominations)
  * [`POST hugo/:id/nominate`](#post-hugoidnominate)
* [Hugo Admin](#hugo-admin)
  * [`GET hugo/admin/ballots`](#get-hugoadminballots)
  * [`GET hugo/admin/ballots/:category`](#get-hugoadminballotscategory)
  * [`GET hugo/admin/canon`](#get-hugoadmincanon)
  * [`POST hugo/admin/canon/:id`](#post-hugoadmincanonid)
  * [WebSocket: `hugo/admin/canon-updates`](#websocket-hugoadmincanonupdates)
  * [`POST hugo/admin/classify`](#post-hugoadminclassify)
  * [`GET hugo/admin/nominations`](#get-hugoadminnominations)
* [Raami exhibitions](#raami)

----

## Public information

### `GET public/people`
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


### `GET public/stats`
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

### `POST key`
- Parameters: `email`, `name`, `path`, `reset`

If `email` matches (case-insensitively) a known address, send a login link to
that address. If no key exists or `reset` is true-ish, generate a new key. If
no match is found for `email` and `name` is set, create a new non-member account
and login key, and send a login link to `email`. If `path` is set, it will be
included in the login link as the value of the `next` query parameter.

#### Response
```
{
  status: 'success',
  email: 'address@example.com'
}
```


### `GET/POST login`
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


### `GET/POST logout`
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

### `GET user`
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


### `GET user/log`
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

### `GET people`
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


### `POST people`
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


### `GET people/:id`
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


### `GET people/:id/log`
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


### `POST people/:id`
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


### `POST people/:id/upgrade`
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


### `POST people/lookup`
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


### WebSocket: `people/updates`
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

### `POST purchase`
- Parameters: `account`, `amount`, `email`, `source`,
  `new_members: [ { membership, email, legal_name, public_first_name, public_last_name, city, state, country, paper_pubs }, ... ]`,
  `upgrades: [ { id, membership, paper_pubs }, ... ]`

Using the `source` (or token) object received from Stripe, make a charge of
`amount` on the card (once verified against the server-side calculated sum from
the items) and add the `new_members` to the database as well as applying the
specified `upgrades`. For new members, generate a login key and include it in
the welcome email sent to each address. Sends an info message to each new or
upgraded member.

#### Response
```
{
  status: 'success',
  charge_id
}
```

### `GET purchase/data`

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

### `GET purchase/keys`

Current public Stripe keys. Includes at least the `default` key. If a non-default
key is used, its name should be passed to `POST` purchase calls as the value of
`account`.

#### Response
```
{
  default: 'pk_test_...',
  ...
}
```

### `GET purchase/list`

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

### `POST purchase/other`
Parameters:
- `account`: Optional, used to set indicate an alternative Stripe account name
- `email`: They payer's email address
- `source: { id, ... }`: Received from Stripe, used to make the charge
- `items`: Array of payment objects, each consisting of:
  - `amount`, `currency`: The charge amount, in integer cents of `currency`
  - `person_id`, `person_name`: The beneficiary of the payment (optional)
  - `category`, `type`, `data`: Required to match entries returned by
    [`GET purchase/data`](#get-purchasedata)
  - `comments`, `invoice`: Optional strings

Using the `source` received from Stripe, make a charge on the card or account
and adds entries to the `Payments` table for each item. Sends an info email to
each item's beneficiary.

#### Request
```
{
  email: '...',
  source: { id: '...' },
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
  status: 'succeeded' || 'pending' || 'failed',
  charge_id: '...'
}
```

### `GET purchase/prices`

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


## Slack

### `POST slack/invite`

Send the user an invitation via email to join the organisation's Slack. Requires
the env vars `SLACK_ORG` and `SLACK_TOKEN` to be set, with the token having both
the `client` and `admin` permission scopes granted. Attempting to re-send an
invitation will return an error.

#### Response
```
{
  success: true,
  email
}
```


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


## Raami Arts Show Exhibitions

<!-- router.get('/:id/artist', db.getArtist);
router.post('/:id/artist', db.upsertArtist);
router.get('/:id/works', db.getWorks);
router.put('/:id/works', db.createWork);
router.post('/:id/works/:work', db.updateWork);
router.delete('/:id/works/:work', db.removeWork);
 -->

```

### `GET raami/:id/artist/`

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

### `POST raami/:id/artist`

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


### `GET raami/:id/works`

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


### `GET raami/:id/work/:work`

- Requires authentication
- Parameters: `id` (required) member id, `work` (required) work id

Full details for singular work.

#### Response
```
  {id:999, people:id: 1, title:'text', width: 10, height: 10, depth: 10… }

```

### `POST raami/:id/work`

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

### `PUT raami/:id/work/:work`

- Requires authentication
- Parameters: `work`(required) as `id` , `id` (required) as `people_id`, `title`, `width`, `height`, `depth`, `gallery`,`orientation`, `technique`, `filename`, `filedata`, `year`, `price`

Update works's details.

#### Response
```
{
  status: 'success',
}
```

### `DELETE raami/:id/work/:work`

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

# Raami Art Show / Exhibitions API

All `raami` endpoints require authentication, and should be prefixed with
`/api/raami/:id/`, where `id` is the id of a person with the email address that's
currently authenticated, or the user has `raami_admin` authority.

- [`GET artist`](#get-artist)
- [`POST artist`](#post-artist)
- [`GET works`](#get-works)
- [`GET work/:work`](#get-workwork)
- [`POST work`](#post-work)
- [`PUT work/:work`](#put-workwork)
- [`DELETE work/:work`](#delete-workwork)

---

### `GET artist`

Full details for singular artist connected to member with `id`.

#### Response

```
  {
    continent: 'Europe',
    url: 'http://www.example.com',
    filename: 'portfolio.pdf',
    portfolio: [bytes],
    category: 'Cover artist',
    orientation: 'Fantasy',
    description: 'Who is the artist etc.',
    transport: 'Air mail',
    …
  }
```

### `POST artist`

- Parameters: `people_id`, `name`, `continent`, `url`, `filename`, `filedata`,
  `category`, `description`, `transport`, `auction`, `print`, `digital`, `legal`,
  `agent`, `contact`, `waitlist`, `postage`

Update or insert artist's details for this member.

#### Response

```
{
  status: 'success',
  people_id: 1
}
```

### `GET works`

Get details for works by artist with this member id.

#### Response

```
[
  { id:999, people:id: 1, title:'text', width: 10, height: 10, depth: 10, … }
  …
]
```

### `GET work/:work`

- Parameters: `work` (required)

Full details for singular work.

#### Response

```
  { id:999, people_id: 1, title:'text', width: 10, height: 10, depth: 10, … }
```

### `POST work`

- Parameters: `title`, `width`, `height`, `depth`, `gallery`,`orientation`,
  `technique`, `filename`, `filedata`, `year`, `price`

Insert works's details for this member id.

#### Response

```
{
  status: 'success',
  inserted: [ 'artist_id', 'title', 'width', 'height', 'technique', 'graduation', 'filename', 'image', 'price' ]
}
```

### `PUT work/:work`

- Parameters: `work` (required), `title`, `width`, `height`, `depth`, `gallery`,
  `orientation`, `technique`, `filename`, `filedata`, `year`, `price`

Update works's details.

#### Response

```
{
  status: 'success',
}
```

### `DELETE work/:work`

- Patameters: `work` (required)

Remove this work from artist's works with id.

#### Response

```
{
  status: 'success',
  deleted: [ `id` ]
}
```

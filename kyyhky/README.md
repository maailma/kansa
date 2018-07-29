# Kyyhky

An internal mailing service for hugo & kansa, built using [Bull]. New messages
are queued by a `POST /email/:type` request, where `:type` identifies one of
the known [message templates](../config/message-templates). The content-type
must be `application/json` and the request body must contain an object that has
at least a valid `email` field.

Adding a `delay` query parameter will cancel any previous job that has matching
`:type` and `email` values; this is used to throttle Hugo nomination and voting
update emails so that they're only sent after a set period of inactivity, which
is defined in **minutes**.

```
POST /email/hugo-update-nominations?delay=30 HTTP/1.1
Host: kyyhky
Content-Type: application/json

{
  "email": <string>,
  "nominations": <array>,
  ...
}
```

## SendGrid configuration

Kyyhky uses [SendGrid] to actually send e-mail, and synchronises the member
data to that service. You'll need an account there, and you should set the
`SENDGRID_APIKEY` environment variable to your SendGrid API key. If that
variable is unset, Kyyhky will mock the SendGrid API internally.

Furthermore, you should set up your account there with the following
[custom fields], all of type `text` (These may then be used to define segments
of the membership for mailings):
- `membership`, `name`, `login_url`
- `attending_name_#`, `attending_barcode_url_#` with `#` replaced by each of `1`, `2`, `3`
- `hugo_name_#`, `hugo_login_url_#` with `#` replaced by each of `1`, `2`, `3`, `4`

All SendGrid API calls are properly throttled. Updates are pushed with the
following API, with the data keyed to be unique to each email address. To
remove an entry (or to change an email address), include an object
`{ email, delete: true }` in the request:

```
POST /update-recipients HTTP/1.1
Host: kyyhky
Content-Type: application/json

[
  {
    "email": "new-address@example.com",
    "hugo_members": [
      { "id": 123, "name": "Member" },
      { "id": 456, "name": "Other Member" }
    ],
    "key": "abc123def456",
    "membership": "Adult",
    "name": "Member and Other Member"
  },
  {
    "email": "old-address@example.com",
    "delete": true
  },
  ...
]
```

[Bull]: https://github.com/OptimalBits/bull
[SendGrid]: https://github.com/sendgrid/sendgrid-nodejs
[custom fields]: https://sendgrid.com/marketing_campaigns/ui/custom_fields

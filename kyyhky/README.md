# Kyyhky

An internal mailing service for hugo & kansa, built on [Kue] and its built-in
REST API. Jobs are automatically removed on completion, and added by:

```
POST /job HTTP/1.1
Host: kyyhky:3000
Content-Type: application/json

{
  "type": "kansa-set-key" || "hugo-update-email" || ...,
  "data": {
    "email": <string>,
    ...
  },
  "options": {
    "delay": <ms>,
    "searchKeys": [] || ["email"],
    ...
  }
}
```

For more options, see [Kue's documentation].


## SendGrid configuration

Kyyhky uses [SendGrid] to actually send e-mail, and synchronises the member
data to that service. You'll need an account there, and you should set the
`SENDGRID_APIKEY` environment variable to your SendGrid API key. If that
variable is unset, Kyyhky will mock the SendGrid API internally.

Furthermore, you should set up your account there with the following
[custom fields], all of type `text` (These may then be used to define segments
of the membership for mailings):
- `membership`, `name`, `login_url`
- `hugo_name_#`, `hugo_login_url_#` with `#` replaced by each of `1`, `2`, `3`, `4`

All SendGrid API calls are properly throttled. Updates are pushed with the
following API, with the data keyed to be unique to each email address. To
remove an entry (or to change an email address), include an object
`{ email, delete: true }` in the request:

```
POST /job HTTP/1.1
Host: kyyhky:3000
Content-Type: application/json

{
  "type": "update-recipients",
  "data": [
    {
      "email": "member@example.com",
      "hugo_members": [
        { "id": 123, "name": "Member" },
        { "id": 456, "name": "Other Member" }
      ],
      "key": "abc123def456",
      "membership": "Adult",
      "name": "Member and Other Member"
    }, ...
  ]
}
```


[Kue]: http://automattic.github.io/kue/
[Kue's documentation]: https://github.com/Automattic/kue/blob/master/Readme.md#post-job
[SendGrid]: https://github.com/sendgrid/sendgrid-nodejs
[custom fields]: https://sendgrid.com/marketing_campaigns/ui/custom_fields

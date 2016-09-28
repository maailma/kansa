# Kyyhky

An internal mailing service for hugo/server & kansa/server, built on
[Kue](http://automattic.github.io/kue/) and its built-in REST API. Jobs are
automatically removed on completion, and added by:

```
POST /job HTTP/1.1
Host: kyyhky:3000
Content-Type: application/json

{
  "type": "kansa-set-key" || "hugo-update-nominations",
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

For more options, see Kue's [own documentation](https://github.com/Automattic/kue/blob/master/Readme.md#post-job).

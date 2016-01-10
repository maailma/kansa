Play Silhouette Postgres Async Seed
===================================

The Play Silhouette Postgres Async Seed project shows how [Silhouette 3.0](https://github.com/mohiva/play-silhouette) can be used
to create an application with Play 2.4, [postgres-async](https://github.com/mauricio/postgresql-async), and [jdub-async](https://github.com/KyleU/jdub-async), 
supporting signing in with Facebook, Google, or Twitter. It's a starting point which can be extended to fit your needs.

## Authentication Behavior

All requests from a new source result in a Session and User being created. 
After signing up, they'll have a credentialed or social profile associated to the User.
You can associate any number of profiles to a User.

## Features

* Sign Up
* Sign In (Credentials)
* Social Auth (Facebook, Google+, Twitter)
* Dynamic Schema Creation
* Role-based Permissions
* User Search Service
* Minimal Dependency Injection with Guice
* Publishing Events

## Configuring social providers 
  
Social providers need to be configured in the application.conf file. 
```
// Facebook
facebook {
  clientId = "CHANGEME"
  clientSecret = "CHANGEME"
}
    
// Google
google {
  clientId = "CHANGEME"
  clientSecret = "CHANGEME"
}

etc...
```
  
## Activator

See https://typesafe.com/activator/template/play-silhouette-postgres-async-seed

# License

The code is licensed under [Apache License v2.0](http://www.apache.org/licenses/LICENSE-2.0).

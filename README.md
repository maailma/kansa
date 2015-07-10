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

## Documentation

Consulate the [Silhouette documentation](http://silhouette.mohiva.com/docs) for more information. If you need help with the integration of Silhouette into your project, don't hesitate and ask questions in our [mailing list](https://groups.google.com/forum/#!forum/play-silhouette) or on [Stack Overflow](http://stackoverflow.com/questions/tagged/playframework).

## Configuring social providers 
  
  Social providers need to be configured in the application.conf file. 
  ```
  // Facebook
  $authProvider.facebook({
    clientId: 'your-client-id',
    ...
  });
  
  // Google
  $authProvider.google({
    clientId: 'your-client-id',
    ...
  });
  ...
  ```
  If you are using Heroku Update the "~\app.json" file with your client secret and client ID.
  ```
  "env": {
    "BUILDPACK_URL": "https://github.com/heroku/heroku-buildpack-multi",
    "NPM_CONFIG_PRODUCTION": "false",
    "PLAY_CONF_FILE": "application.conf",
    "PLAY_APP_SECRET": "changeme",
    "FACEBOOK_CLIENT_ID": "",
    "FACEBOOK_CLIENT_SECRET": "",
    "GOOGLE_CLIENT_ID": "",
    "GOOGLE_CLIENT_SECRET": "",
    "TWITTER_CONSUMER_KEY": "",
    "TWITTER_CONSUMER_SECRET": ""
  }
  ```
  
  To test social providers on localhost, you can either set your system environment variables as defined in the app.json "env" section or manually update the "~\conf\silhouette.conf" file directly with your client ID and client secret.
  ```
  # Google provider
  google.accessTokenURL="https://accounts.google.com/o/oauth2/token"
  google.redirectURL="http://localhost:9000"
  google.clientID="your-client-id"
  google.clientSecret="your-client-secret"
  google.scope="profile email"
  ```

## Activator

See https://typesafe.com/activator/template/play-silhouette-angular-seed

# License

The code is licensed under [Apache License v2.0](http://www.apache.org/licenses/LICENSE-2.0).

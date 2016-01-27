#!/bin/bash

until nc -z postgres 5432
do
  sleep 1
done

sleep 2

echo "Starting hakkapeliitta"

./app/bin/hakkapeliitta -Ddb.host=postgres\
    -Ddb.username=$POSTGRES_USER\
    -Ddb.password=$POSTGRES_PASSWORD\
    -Dstripe.apiKey=$STRIPE_SECRET_APIKEY\
    -Dsendgrid.apiKey=$SENDGRID_APIKEY\
    -Dplay.http.forwarded.trustedProxies=proxy

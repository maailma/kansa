#!/bin/bash
#

# exit if any command exits unsuccessfully
set -e

. ../docker/.env

if [ -z "$DEFAULT_DOMAIN" ]; then
  echo "You must set DEFAULT_DOMAIN in the .env file."
  exit 1
fi

# do we have OpenSSL?
OPENSSL=$(which openssl)

# do we have the config?
SSLDIR=.
SSLCONF="${SSLDIR}/openssl.cnf"
[ -r "$SSLCONF" ]

# do we have the certs dir?
SSLCERTS="${SSLDIR}/certs"
mkdir -p "$SSLCERTS"
[ -d "$SSLCERTS" ]

# make the key and cert
echo "Accept all the defaults unless you have a reason to do otherwise."
echo ""
$OPENSSL req -config $SSLCONF -x509 -newkey rsa:2048 -keyout "${SSLDIR}/certs/${DEFAULT_DOMAIN}.key" -out "${SSLDIR}/certs/${DEFAULT_DOMAIN}.crt" -nodes
echo ""
echo "Self-signed certificate and key generated:"
find "$SSLCERTS" -type f

#!/bin/bash
set -e

/usr/bin/install -c -m 644 /damm/damm.control '/usr/share/postgresql/9.5/extension/'
/usr/bin/install -c -m 644 /damm/damm--1.0.sql  '/usr/share/postgresql/9.5/extension/'

psql -v ON_ERROR_STOP=1 --dbname "$POSTGRES_DB" --username "$POSTGRES_USER" <<-EOSQL
  CREATE EXTENSION damm WITH SCHEMA public;
EOSQL

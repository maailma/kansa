#!/bin/bash
set -e

/usr/bin/install -c -m 644 /damm/damm.control '/usr/share/postgresql/9.5/extension/'
/usr/bin/install -c -m 644 /damm/damm--1.0.sql  '/usr/share/postgresql/9.5/extension/'

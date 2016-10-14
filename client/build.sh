#!/bin/bash
set -e

echo "*** Building static assets..."

npm run build:prod

echo "*** Sleeping..."

while true; do
  sleep 60
done

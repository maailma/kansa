#!/bin/bash

chown hakkapeliitta:hakkapeliitta logs transactions

su -c ./hakkapeliitta-user.sh hakkapeliitta

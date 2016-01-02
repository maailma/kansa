#!/bin/bash
#
# By running this script, you can create Tomcat server container with self signed certificate.
# Please note that the server.xml has been configured to use "changeit" password.
#
sudo openssl req -newkey 2048 -nodes -keyout worldcon.key -x509 -days 365 -out worldcon.crt
sudo openssl pkcs12 -inkey worldcon.key -in worldcon.crt -export -out worldcon.pfx
docker build -t tomcat_ssl .

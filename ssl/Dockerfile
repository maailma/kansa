FROM tomcat:8-jre8

RUN apt-get update && \
    apt-get install -yq --no-install-recommends ca-certificates expect && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/ssl/tomcat && chmod 755 /etc/ssl/tomcat

COPY server.xml /usr/local/tomcat/conf/.
COPY worldcon.pfx /etc/ssl/tomcat/.

EXPOSE 8443

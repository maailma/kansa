FROM openresty/openresty:jessie

RUN apt-get update && \
  apt-get install --no-install-recommends --no-install-suggests -y \
    gettext-base \
	&& rm -rf /var/lib/apt/lists/*

RUN /usr/local/openresty/luajit/bin/luarocks install lua-resty-jwt

ARG SERVER_NAME
ARG SSL_CERTIFICATE
ARG SSL_CERTIFICATE_KEY

COPY nginx.conf /nginx.conf.template
RUN envsubst '$$SERVER_NAME $$SSL_CERTIFICATE $$SSL_CERTIFICATE_KEY' \
  < /nginx.conf.template \
  > /usr/local/openresty/nginx/conf/nginx.conf

COPY hugo-packet.lua /
COPY admin.html /srv/client/
COPY index.html /srv/client/

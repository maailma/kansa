FROM openresty/openresty:jessie

RUN apt-get update && \
  apt-get install --no-install-recommends --no-install-suggests -y \
    gettext-base \
	&& rm -rf /var/lib/apt/lists/*

RUN /usr/local/openresty/luajit/bin/luarocks install lua-resty-jwt

COPY hugo-packet.lua /
COPY nginx.conf /nginx.conf.template
COPY admin.html /srv/client/
COPY index.html /srv/client/

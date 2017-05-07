FROM nginx:stable

ARG SERVER_NAME
ARG SSL_CERTIFICATE
ARG SSL_CERTIFICATE_KEY

COPY nginx.conf /nginx.conf.template
RUN envsubst '$$SERVER_NAME $$SSL_CERTIFICATE $$SSL_CERTIFICATE_KEY' \
  < /nginx.conf.template \
  > /etc/nginx/conf.d/default.conf

COPY admin.html /usr/share/nginx/html/client/
COPY index.html /usr/share/nginx/html/client/

FROM java:8-jre

RUN apt-get update && apt-get install -f -y netcat-openbsd

RUN mkdir /hakkapeliitta
COPY temp/hakkapeliitta*.tgz /hakkapeliitta
RUN cd /hakkapeliitta && tar -xzf *.tgz && rm *.tgz && mv hakkapeliitta* app
COPY hakkapeliitta*.sh /hakkapeliitta/

RUN groupadd -r hakkapeliitta && \
    useradd -r -g hakkapeliitta hakkapeliitta && \
    chown -R hakkapeliitta:hakkapeliitta /hakkapeliitta/

WORKDIR /hakkapeliitta/

CMD ["./hakkapeliitta.sh"]


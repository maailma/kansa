FROM java:8-jre

RUN mkdir /hakkapeliitta
COPY hakkapeliitta/target/universal/hakkapeliitta*.tgz /hakkapeliitta
RUN cd /hakkapeliitta && tar -xzf *.tgz && rm *.tgz && mv hakkapeliitta* app

RUN groupadd -r hakkapeliitta && \
    useradd -r -g hakkapeliitta hakkapeliitta && \
    chown -R hakkapeliitta:hakkapeliitta /hakkapeliitta/

USER hakkapeliitta
WORKDIR /hakkapeliitta/app

CMD ["./bin/hakkapeliitta"]


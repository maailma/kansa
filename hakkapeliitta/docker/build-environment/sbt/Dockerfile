FROM java:8


ENV PATH ${PATH}:/home/imonroe/bin
ENV DEV_GID 100
ENV DEV_UID 1000

RUN groupadd -g $DEV_GID -r imonroe || true
RUN useradd -m -u $DEV_UID -r -g $DEV_GID imonroe

USER imonroe

RUN mkdir ~/bin && cd ~/bin && wget -O sbt-launch.jar https://repo.typesafe.com/typesafe/ivy-releases/org.scala-sbt/sbt-launch/0.13.9/sbt-launch.jar
COPY sbt /home/imonroe/bin/sbt

WORKDIR /api/hakkapeliitta
CMD ["sbt", "copyPackage"]

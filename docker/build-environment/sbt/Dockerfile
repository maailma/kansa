FROM java:8


ENV PATH ${PATH}:/home/imonroe/bin

RUN groupadd -g 1002 -r imonroe && \
    useradd -m -u 1002 -r -g imonroe imonroe


USER imonroe

RUN mkdir ~/bin && cd ~/bin && wget -O sbt-launch.jar https://repo.typesafe.com/typesafe/ivy-releases/org.scala-sbt/sbt-launch/0.13.9/sbt-launch.jar
COPY sbt /home/imonroe/bin/sbt

WORKDIR /api/hakkapeliitta
CMD ["sbt", "copyPackage"]

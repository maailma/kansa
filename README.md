# Worldcon 75 API Service [![DockerPulls](https://img.shields.io/docker/stars/worldcon75/api.svg)](https://hub.docker.com/r/worldcon75/api/)

## Development Environment

This provides a sample development environment for the Worldcon 75 API service.  Our stack is [Scala 2.11](http://scala-lang.org/), [Play Framework 2.4](https://www.playframework.com/) and [PostgreSQL 9.4](http://www.postgresql.org/).

The environment is provisioned via [Docker](https://www.docker.com/) containers.

1. Install [Docker Toolbox](https://www.docker.com/docker-toolbox). Or on Linux you could just install Docker Client and Docker Compose.

2. Step through the platform-appropriate Getting Started Guide ([OS X](https://docs.docker.com/mac/)/[Windows](https://docs.docker.com/windows/)/[Linux](https://docs.docker.com/linux/)).  If you cannot complete step three, "Find and run the whalesay image", then do not proceed further, instead contact @hakamadare for assistance.

3. Check out this repository and open a terminal session at the top-level directory.

4. Write a `.env` file in the docker directory.  A sample file is in Google Drive, in the DevOps folder.

5. You can install a Java Dev environment or use a Docker composition to build the project.
   1. Normal install - recommended for Scala developers.
      1. Install Java 8, ensure java and javac is on the path.
      2. [Install sbt](http://www.scala-sbt.org/download.html)
      3. [Install IntelliJ Community Edition](https://www.jetbrains.com/idea/download/) (Optional.)
      4. Run `sbt copyPackage` in the hakkapeliitta directory.
   2. Docker build
      1. Edit the DEV_UID and DEV_GID variables in docker/build-environment/sbt/Dockerfile to match your host UID and GID
      2. run `docker-compose run sbt` in docker/build-environment

6. Run `docker-compose build` in the docker directory.

7. Run `docker-compose up -d`

8. You can view `docker-compose logs` to view the logs from the all containers mixed together. You can also do, for instance, `docker-compose logs proxy` to get the nginx logs.

9. `docker-compose kill`, `docker-compose rm -f` and repeat steps 5-7 to wipe out and deploy a new version of Hakkapeliitta.
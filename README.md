# Worldcon 75 API Service [![DockerPulls](https://img.shields.io/docker/stars/worldcon75/api.svg)](https://hub.docker.com/r/worldcon75/api/)

## Development Environment

This provides a sample development environment for the Worldcon 75 API service.  Our stack is [Scala 2.11](http://scala-lang.org/), [Tomcat 8](http://tomcat.apache.org/), [Redis 2.8](http://redis.io/), and [PostgreSQL 9.4](http://www.postgresql.org/).

The environment is provisioned via [Docker](https://www.docker.com/) containers.

1. Install [Docker Toolbox](https://www.docker.com/docker-toolbox).

2. Step through the platform-appropriate Getting Started Guide ([OS X](https://docs.docker.com/mac/)/[Windows](https://docs.docker.com/windows/)/[Linux](https://docs.docker.com/linux/)).  If you cannot complete step three, "Find and run the whalesay image", then do not proceed further, instead contact @hakamadare for assistance.

3. Check out this repository and open a terminal session at the top-level directory.

4. Write a `.env` file at the top level.  A sample file is in Google Drive, in the DevOps folder.

5. Run `docker-compose up`.  You should see several containers start up and output logs to the terminal.

6. Confirm that your environment started correctly by running `docker-compose ps` in another terminal. If the command could not connect to Docker daemon, run `eval "$(docker-machine env default)"` to set Docker environment variables.  A healthy environment looks like this:
```
$ docker-compose ps
Name                    Command                         State     Ports
----------------------------------------------------------------------------------------------------------
api_api_1               catalina.sh run                 Up        0.0.0.0:8080->8080/tcp
api_consul_1            /bin/start -server -bootst ...  Up        53/tcp, 0.0.0.0:8600->53/udp, 8300/tcp,
                                                                  8301/tcp, 8301/udp, 8302/tcp, 8302/udp,
                                                                  0.0.0.0:8400->8400/tcp,
                                                                  0.0.0.0:8500->8500/tcp
api_postgres_1          /docker-entrypoint.sh postgres  Up        5432/tcp
api_redis_1             /entrypoint.sh redis-server     Up        6379/tcp
```

7. If you're not on a Linux system, find the IP address of your local Docker VM by running `docker-machine ip default`.  **NOTE** The Docker documentation is inconsistent; if you follow the Getting Started instructions you'll end up with a local machine called "dev", while if you start up Kitematic you'll end up with a local machine called "default".  Modify the above command appropriately for your case.

8. Open `http://<THE IP ADDRESS FROM THE PREVIOUS COMMAND>:8080` in a web browser; you should see the root of the web application.

## Deploying Code

1. Install Scala (I suggest using [scalaenv](https://github.com/mazgi/scalaenv), if you do it some other way you're on your own).

2. Install sbt (I suggest using [sbtenv](https://github.com/mazgi/sbtenv), if you do it some other way you're on your own).

3. Edit the project (source code lives down `src`).

4. Build a new WAR by running `sbt clean package`.

5. The Docker container mounts your local filesystem and reads the compiled files directly from your workstation, so you don't need to change the Docker image in order to deploy code changes.  Tomcat will reload itself when it detects that the underlying files have changed.

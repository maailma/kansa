## Installing dev environment in Linux (docker-toolbox-like option)


In case one wishes to set up the development environment to use local boot2docker virtualbox, instead of running containers directly on the host system, these steps will help you to set one up in Ubuntu based operating system.


**IMHO, This is a horrible hack, and you'd be much better off by running the containers directly on your host machine via `docker-compose up &`**, in which case you'll get the IP of the api via command: `docker inspect --format '{{ .NetworkSettings.IPAddress }}' <api_name>_api_1` (by defaultm, the <api_name> seems to be set based on the project folder name, where all non-ascii characters have been removed. Verify via `docker-compose ps` command.)


### Install all needed programs

Install Docker:<br>
Please follow the instructions here: [https://docs.docker.com/engine/installation/](https://docs.docker.com/engine/installation/)


Install VirtualBox:<br>
Please make sure you get the VirtualBox 5.x.<br>
Please follow the instructions here: [https://www.virtualbox.org/wiki/Downloads](https://www.virtualbox.org/wiki/Downloads)


Install Docker Compose:
```
$ curl -L https://github.com/docker/compose/releases/download/1.5.2/docker-compose-`uname -s`-`uname -m` > docker-compose
$ chmod +x docker-compose
$ sudo mv docker-compose /usr/local/bin/.
```


Install Docker Machine:
```
$ curl -L https://github.com/docker/machine/releases/download/v0.5.3/docker-machine_linux-amd64 > docker-machine
$ chmod +x docker-machine
$ sudo mv docker-machine /usr/local/bin/.
```


### Set up the environment for the VirtualBox Docker Machine
Get the base code from github:
```
$ git clone git@github.com:worldcon75/api.git
```
If you prefer another than "api" as the project folder, please add target folder name at the end of the git clone command.


Create the docker machine:

**NOTE!** In order for docker-compose to mount needed folder in the docker-machine, you may need to add yourself to the "vboxsf" group by,
```
$ sudo usermod -aG vboxsf <your username>
# Log out and back in after this command
```

I've created a shell script for your convenience.<br>
in the file `setup-linux.sh`, please adjust the variable `VM_NAME`to your liking.<br>
Then run:
```
./setup-linux.sh
```
At this point you should be ready to follow the deployment [instructions here](https://github.com/worldcon75/api#deploying-code).


## Possible Problems
In case after removing the docker machine you may encounter errors with `docker-compose` command.<br>
For instance:
```
$ docker-compose ps
Traceback (most recent call last):
  File "<string>", line 3, in <module>
  File "/code/compose/cli/main.py", line 54, in main
  File "/code/compose/cli/docopt_command.py", line 23, in sys_dispatch
  File "/code/compose/cli/docopt_command.py", line 26, in dispatch
  File "/code/compose/cli/main.py", line 169, in perform_command
  File "/code/compose/cli/command.py", line 53, in project_from_options
  File "/code/compose/cli/command.py", line 89, in get_project
  File "/code/compose/cli/command.py", line 70, in get_client
  File "/code/compose/cli/docker_client.py", line 23, in docker_client
  File "/code/.tox/py27/lib/python2.7/site-packages/docker/utils/utils.py", line 412, in kwargs_from_env
  File "/code/.tox/py27/lib/python2.7/site-packages/docker/tls.py", line 46, in __init__
docker.errors.TLSParameterError: Path to a certificate and key files must be provided through the client_config param. TLS configurations should map the Docker CLI client configurations. See http://docs.docker.com/examples/https/ for API details.
docker-compose returned -1
```
This and some other anomalies can be fixed by unsetting some env variables:
```
unset DOCKER_CERT_PATH \
unset DOCKER_HOST \
unset DOCKER_MACHINE_NAME \
unset DOCKER_TLS_VERIFY
```
In case the Docker Machine has been shut down incorrectly, or the dev containers have gotten somehow into the haywired state, just remove the folder "~/.docker/machine/", and run the `setup-linux.sh` script again. **Be careful with removing the "machine" folder, in case you have other Docker MAchines set up**. In which case you may or may need to try to recreate the SSL certificates for the Docker VM again.

#### Snippets
Find the IP address of your local Docker VM by running `docker-machine ip worldcon-api`.<br>
To log-on to the Docker VM, `docker-machine ssh worldcon-api`.<br>
You can check the status of your docker containers by running `docker-compose ps`.

#### References
How to mount local volumes in docker machine [StackOverflow](http://stackoverflow.com/questions/30040708/how-to-mount-local-volumes-in-docker-machine)
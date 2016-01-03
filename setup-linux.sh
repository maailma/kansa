#!/bin/bash

# In your project folder
# My docker VM name is "worldcon-api"
VM_NAME="worldcon-api"

# Get rid of the HostOnly Adapter which is a showstopper with boot2docker environment recreation.
eval a=\$$(VBoxManage showvminfo ${VM_NAME} --machinereadable | grep hostonlyadapter)
ADAPTER=${a#*=}
VBoxManage hostonlyif remove ${ADAPTER}

docker-machine stop ${VM_NAME}
docker-machine rm ${VM_NAME}

# Just in case, get rid of previous VM and ENV variables
unset DOCKER_CERT_PATH
unset DOCKER_HOST
unset DOCKER_MACHINE_NAME
unset DOCKER_TLS_VERIFY

rm -rf ~/.docker/machine/machines/${VM_NAME}

set -e

# Crate Docker Machine
docker-machine create -d virtualbox ${VM_NAME}
eval "$(docker-machine env ${VM_NAME})"
export | grep DOCKER

# Create and copy needed mount process to VM. 
cat << EOF > bootlocal.sh
mkdir -p LFOLDER
mount -t vboxsf -o defaults,uid=\`id -u docker\`,gid=\`id -g docker\` webapp LFOLDER
EOF
LFOLDER=$(pwd)/target/webapp
sed -i "s#LFOLDER#${LFOLDER}#g" ./bootlocal.sh
chmod +x ./bootlocal.sh
docker-machine scp ./bootlocal.sh ${DOCKER_MACHINE_NAME}:.
docker-machine ssh ${DOCKER_MACHINE_NAME} "sudo mv ./bootlocal.sh /mnt/sda1/var/lib/boot2docker/."
rm -f ./bootlocal.sh

# Stop machine in order to create shared folder
docker-machine stop ${DOCKER_MACHINE_NAME}
VBoxManage sharedfolder add ${DOCKER_MACHINE_NAME} --name webapp --hostpath $(pwd)/target/webapp/ --automount
docker-machine start ${DOCKER_MACHINE_NAME}

# Get the IP of your Docker Machine
MACHINE_IP=$(docker-machine ip ${DOCKER_MACHINE_NAME})
echo 
echo "The IP address of your docker machine is: ${MACHINE_IP}"
echo
sleep 4
echo "Now starting the containers...."
echo
sleep 2

# Finally start the containers
docker-compose up &

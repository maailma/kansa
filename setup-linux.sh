#!/bin/bash

set -e

# In your project folder
# My docker VM name is "worldcon-api"
VM_NAME="worldcon-api"

# Just in case, get rid of previous VM and ENV variables
rm -rf ~/.docker/machine/machines/${VM_NAME}

unset DOCKER_CERT_PATH
unset DOCKER_HOST
unset DOCKER_MACHINE_NAME
unset DOCKER_TLS_VERIFY

# Crate Docker Machine
docker-machine create -d virtualbox ${VM_NAME}

# Create and copy needed mount process to VM. 
cat << EOF > bootlocal.sh
mkdir -p LFOLDER
mount -t vboxsf -o defaults,uid=\`id -u docker\`,gid=\`id -g docker\` webapp LFOLDER
EOF
export LFOLDER=$(pwd)/target/webapp
sed -i "s#LFOLDER#${LFOLDER}#g" ./bootlocal.sh
chmod +x ./bootlocal.sh
docker-machine scp ./bootlocal.sh ${VM_NAME}:.
docker-machine ssh ${VM_NAME} "sudo mv ./bootlocal.sh /mnt/sda1/var/lib/boot2docker/."
rm -f ./bootlocal.sh

# Stop machine in order to create shared folder
docker-machine stop ${VM_NAME}
VBoxManage sharedfolder add ${VM_NAME} --name webapp --hostpath $(pwd)/target/webapp/ --automount
docker-machine start ${VM_NAME}

# Get the IP of your Docker Machine
MACHINE_IP=$(docker-machine ip ${VM_NAME})
echo 
echo "The IP address of your docker machine is: ${MACHINE_IP}"
echo
sleep 4
echo "Now starting the containers...."
echo
sleep 2

# Finally start the containers
eval $(docker-machine env ${VM_NAME})
docker-compose up &
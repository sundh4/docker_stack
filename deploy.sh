#!/bin/bash

# User password docker
duser="$1"
dpass="$2"

KUBE_DIR="$HOME/kube-jupy"
SRC_JUPYR_DIR="$HOME/docker_stack/JupyterLabR"

SRC_PYLIB="/mnt/public/Libs/PyLibs"

# Sync Pylib first
rsync -ahP --exclude .ipynb_checkpoints/ --exclude __pycache__/ --exclude __init__.py~ --delete \
"$SRC_PYLIB/" "$KUBE_DIR/utils/Py/PythonAl/"

# Change working directory to Docker JupyterR Dir
cd "$SRC_JUPYR_DIR" || echo "Directory not found, exit script" && exit 1

# Login to docker first
echo "$dpass" | docker login -u "$duser" --password-stdin

# Build docker
./build.sh

# Get digest
digest_sha=$(docker images --digests sundh4/jupylabr |grep latest |awk '{print $3}')

# Logout docker
docker logout

# Start deploy kubernetes with new image

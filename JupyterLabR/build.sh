#!/bin/bash
# Ignore some warning
# shellcheck disable=SC2154

source .env
docker build -t "$baseimg" . && docker tag "$(docker images "$baseimg" -q)" "sundh4/$baseimg:latest" && docker push "sundh4/$baseimg:latest"

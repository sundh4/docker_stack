#!/bin/bash
# Ignore some warning
# shellcheck disable=SC2154

source .env
docker build -t "$tag" . && docker tag "$(docker images "$tag" -q)" "sundh4/$baseimg:$tag" && docker push "sundh4/$baseimg:$tag"

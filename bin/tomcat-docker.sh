#!/usr/bin/env bash

cd -P "${BASH_SOURCE[0]%/*}/.." || exit 1

# Inspired by:
# - Stack Overflow: Build and run Dockerfile with one command
#   https://stackoverflow.com/a/51314059

IMAGE_ID="$(docker build -q -f dockerfiles/Dockerfile.tomcat-test .)"
docker run --rm "$IMAGE_ID"
docker rmi "$IMAGE_ID"

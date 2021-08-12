#!/bin/bash

DIR=$(echo $(cd $(dirname "${BASH_SOURCE[0]}") && pwd -P))
_RUSH="${DIR}/docker_rush.sh"
_RUSHX="${DIR}/docker_rushx.sh"

$_RUSH install
$_RUSH build
$_RUSHX libs/sdk-ui-tests-e2e build-scenarios

BUILD_IMAGE='harbor.intgdc.com/tools/gdc-frontend-node:node-12.16.1-yarn-1.22.4'

docker build --file ./libs/sdk-ui-tests-e2e/Dockerfile -t gooddata-ui-sdk-scenarios . || exit 1

docker run \
    -e USERID=$(id -u $USER) \
    -e FORCE_COLOR=0 \
    -w /workspace/libs/sdk-ui-tests-e2e \
    -v "$(pwd)":/workspace \
    -t $BUILD_IMAGE || exit 1

NO_COLOR=1 IMAGE_ID=gooddata-ui-sdk-scenarios docker-compose -f ./libs/sdk-ui-tests-e2e/docker-compose-isolated.yaml up --abort-on-container-exit --exit-code-from isolated-tests --force-recreate --always-recreate-deps --renew-anon-volumes --no-color
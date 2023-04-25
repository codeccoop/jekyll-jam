#! /bin/bash

source .env

workflow_id=$1

if [ -z "$workflow_id" ]; then
    echo "You should define workflow id"
    exit
fi

curl -H "Accept: application/vnd.github+json" \
    -H "Authorization: token $GH_ACCESS_TOKEN"\
    https:/api.github.com/repos/$GH_USER/$GH_REPO/actions/runs/$workflow_id/artifacts

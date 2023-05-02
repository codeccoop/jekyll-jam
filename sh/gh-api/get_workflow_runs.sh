#! /bin/bash

if [ -f .env.local ]; then
    source .env.local
else
    source .env
fi

workflow_id=$1

if [ -z "$workflow_id" ]; then
    echo "You should define workflow id"
    exit
fi

curl -H "Accept: application/vnd.github+json" \
    -H "Authorization: token $GH_ACCESS_TOKEN"\
    https:/api.github.com/repos/$GH_USER/$GH_REPO/actions/workflows/$workflow_id/runs

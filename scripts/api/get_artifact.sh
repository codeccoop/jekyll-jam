#! /bin/bash

source .env

artifact_id=$1
format=$2

curl -H "Accept: application/vnd.github+json" \
    -H "Authorization: token $GH_ACCESS_TOKEN"\
    https:/api.github.com/repos/$GH_USER/$GH_REPO/actions/artifacts/$artifact_id/$format

#! /bin/bash

if [ -f .env.local ]; then
    source .env.local
else
    source .env
fi

artifact_id=$1
format=$2

curl -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GH_ACCESS_TOKEN" \
    https:/api.github.com/repos/$GH_USER/$GH_REPO/actions/artifacts/$artifact_id/$format \
    -o artifact.$format

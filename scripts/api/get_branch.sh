#! /bin/bash

source .env

curl -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GH_ACCESS_TOKEN" \
    https:/api.github.com/repos/$GH_USER/$GH_REPO/branches/$1

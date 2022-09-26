#! /bin/bash

source .env

curl -H "Accept: application/vnd.github+json"  \
    -H "Authorization: token $GH_ACCESS_TOKEN" \
    https:/api.github.com/repos/$GH_USER/$GH_REPO/git/trees \
    -d "{\"base_tree\":\"$1\",\"tree\":$(cat $2)}"

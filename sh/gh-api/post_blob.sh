#! /bin/bash

if [ -f .env.local ]; then
    source .env.local
else
    source .env
fi

curl -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: token $GH_ACCESS_TOKEN" \
    https:/api.github.com/repos/$GH_USER/$GH_REPO/git/blobs \
    -d "{\"content\":\"$(cat $1)\",\"encoding\":\"utf-8\"}"

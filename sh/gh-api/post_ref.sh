#! /bin/bash

if [ -f .env.local ]; then
    source .env.local
else
    source .env
fi

curl -H "Accept: application/vnd.github+json" \
    -H "Authorization: token $GH_ACCESS_TOKEN" \
    -d "{\"ref\":\"refs/heads/$1\",\"sha\":\"$2\"}" \
    -X POST \
    https:/api.github.com/repos/$GH_USER/$GH_REPO/git/refs

#! /bin/bash

source .env

curl -H "Accept: application/vnd.github+json" \
    -H "Authorization: token $GH_ACCESS_TOKEN" \
    https:/api.github.com/repos/$GH_USER/$GH_REPO/git/commits \
    -d "{\"message\":\"$3\",\"author\":{\"name\":\"API User\",\"email\":\"$GH_USER@mozmail.com\",\"date\":\"$(date +"%Y-%m-%dT%H:%M:%S+12:00")\"},\"parents\":[\"$2\"],\"tree\":\"$1\"}"

#! /bin/bash

source .env

curl \
  -i \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token $GH_ACCESS_TOKEN" \
  https://api.github.com/repos/$GH_USER/$GH_REPO/pulls

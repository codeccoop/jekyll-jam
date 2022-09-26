#! /bin/bash

source .env

curl \
  -i \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token $GH_ACCESS_TOKEN" \
  https://api.github.com/repos/$GH_USER/$GH_REPO/pages \
  -d '{"source": {"branch": "jekyll-jam", "path": "/"}}'

#! /bin/bash

source .env

curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GH_ACCESS_TOKEN" \
  https://api.github.com/repos/codeccoop/vocero-minima/generate \
  -d '{"owner":"lucasgarciabaro","name":"Template test","description":"This is your first repository","include_all_branches":false,"private":false}'

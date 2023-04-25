#! /bin/bash

source .env

curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GH_ACCESS_TOKEN"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/user/repos \
  -d '{"name":"Hello-World","description":"This is your first repo!","homepage":"https://github.com","private":false,"is_template":false}'

#! /bin/bash

VOCERO_HOME=$(cd $(dirname $0) && cd .. && echo $PWD)
cd $VOCERO_HOME

if [ -f .env.local ]; then
    source .env.local
else
    source .env
fi

cd client && npm install --loglevel=WARN && npm run build && cd -
composer install --no-progress --no-suggest --no-interaction

if [ -f vocero.zip ]; then
    rm vocero.zip
fi

zip -r vocero.zip static/ vendor/ api/ index.html .htaccess .project ".env.local"

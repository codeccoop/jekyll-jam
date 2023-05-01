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

put () {
    file=$1
    echo "PUT $file"
    ftp ftp://$VOCERO_FTP_USR:$VOCERO_FTP_PWD@$VOCERO_FTP_HOST <<END_SCRIPT
binary
cd $VOCERO_FTP_PATH
put $file
quit
END_SCRIPT
}

recursive_put () {
    echo "List $VOCERO_HOME/$1"
    ftp ftp://$VOCERO_FTP_USR:$VOCERO_FTP_PWD@$VOCERO_FTP_HOST <<END_SCRIPT
binary
cd $VOCERO_FTP_PATH
mkdir $1
END_SCRIPT

    for file in $(ls $1); do
        if [ -d $1/$file ]; then
            recursive_put $1/$file
        else
            put $1/$file
        fi
    done
}

recursive_put api
recursive_put static
recursive_put vendor
put index.html

if [ -f .env.local ]; then
    put .env.local
else
    put .env
fi

put .htaccess

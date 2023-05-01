#! /bin/bash

DIR=$(cd $(dirname $0) && cd .. && echo $PWD)
source .env

cd client && npm install --loglevel=WARN && npm run build && cd -
composer install --no-progress --no-suggest --no-interaction

put () {
    file=$1
    echo "PUT $file"
    test 0 && ftp ftp://$VOCERO_FTP_USR:$VOCERO_FTP_PWD@$VOCERO_FTP_HOST <<END_SCRIPT
binary
cd $VOCERO_FTP_PATH
put $file
quit
END_SCRIPT
}

recursive_put () {
    $dir = $VOCERO_FTP_PATH/$1
    echo "List $dir"
    test 0 && ftp ftp://$VOCERO_FTP_USR:$VOCERO_FTP_PWD@$VOCERO_FTP_HOST <<END_SCRIPT
binary
mkdir $dir
END_SCRIPT

    for file in $(ls $dir); do
        if [ -d $file ]; then
            recursive_put $dir/$file
        else
            put $dir/$file
        fi
    done
}

recursive_put api
recursive_put static
recursive_put vendor
put index.html

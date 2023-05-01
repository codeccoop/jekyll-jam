#! /bin/bash

DIR=$(cd $(dirname $0) && cd .. && echo $PWD)
source .env

VOCERO_ENV=development php -S localhost:8000

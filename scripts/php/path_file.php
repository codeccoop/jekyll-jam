<?php

$path = '/var/log/apache/error.log';

echo print_r(array_slice(explode('/', $path), 1));

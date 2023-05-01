<?php
$home = VOCERO_API_ROOT . '../';
$file = '.env';

if (getenv('VOCERO_ENV') === 'development') {
    if (is_file($home . $file . '.development.local')) {
        $file = $file . '.development.local';
    } else if (is_file($home . $file . '.development')) {
        $file = $file . '.development';
    }
} else {
    if (is_file($home . $file . '.local')) {
        $file = $file . '.local';
    }
}

$dotenv = Dotenv\Dotenv::createImmutable($home, $file);
$dotenv->load();

define('VOCERO_USER', getenv('VOCERO_USER') ? getenv('VOCERO_USER') : 'http://localhost:8000');
define('VOCERO_PWD', getenv('VOCERO_PWD') ? getenv('VOCERO_PWD') : 'http://localhost:8000');
define('VOCERO_HOST', getenv('VOCERO_HOST') ? getenv('VOCERO_HOST') : 'http://localhost:8000');
define('VOCERO_ORIGINS', getenv('VOCERO_ORIGINS') ? getenv('VOCERO_ORIGINS') : 'http://localhost:3000');
define('VOCERO_DEBUG', getenv('VOCERO_DEBUG') ? getenv('VOCERO_DEBUG') : 1);

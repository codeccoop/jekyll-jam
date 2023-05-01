<?php
define('VOCERO_API_ROOT', realpath(__DIR__) . '/');

require_once VOCERO_API_ROOT . '../vendor/autoload.php';
include_once VOCERO_API_ROOT . 'inc/config.php';


if (isset($_SERVER['ORIGIN']) && !in_array($_SERVER['ORIGIN'], explode(',', VOCERO_ORIGINS))) {
    header('Access-Control-Allow-Origin: ' . VOCERO_ORIGINS);
    exit;
}

require_once VOCERO_API_ROOT . 'router/Router.php';

// TODO: User authentication

Router::resolve();

<?php
require_once __DIR__ . '/inc/bootstrap.php';

require_once VOCERO_API_ROOT . '../vendor/autoload.php';
require_once VOCERO_API_ROOT . 'router/Router.php';

// TODO: User authentication

Router::resolve();

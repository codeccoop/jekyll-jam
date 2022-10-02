<?php
header('Allow: GET');
header('Content-Type: application/x-yaml');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'tree.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'config.php');

$sha = $_GET["sha"];
$tree = (new Tree($sha))->get();
echo (new Config($tree))->json();

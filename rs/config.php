<?php
header('Allow: GET');
header('Content-Type: application/x-yaml');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

require_once realpath(__DIR__ . '/../lib/tree.php');
require_once realpath(__DIR__ . '/../lib/config.php');

$sha = $_GET["sha"];
$tree = (new Tree($sha))->get();
echo (new Config($tree))->json();

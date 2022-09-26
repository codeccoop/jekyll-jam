<?php
header('Allow: GET');
header('Content-Type: application/json');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

require_once realpath(__DIR__ . '/../lib/branch.php');

$branch = new Branch();
echo $branch->json();

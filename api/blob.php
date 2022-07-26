<?php
header('Allow: GET');
header('Content-Type: application/json');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

require_once realpath(__DIR__ . '/../lib/blob.php');

$sha = $_GET["sha"];
$path = $_GET["path"];
$blob = new Blob($sha, base64_decode($path));
echo $blob->json();

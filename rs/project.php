<?php
header('Allow: GET, POST');
header('Content-Type: application/json');

define('DS', DIRECTORY_SEPARATOR);
require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'dotfile.php');

if ('GET' == $_SERVER['REQUEST_METHOD']) {
    echo (new Dotfile())->json();
} else if ('POST' == $_SERVER['REQUEST_METHOD']) {
    $payload = json_decode(file_get_contents('php://input'), true);
    $dotfile = new Dotfile();
    $dotfile->post($payload);
    echo $dotfile->json();
} else {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

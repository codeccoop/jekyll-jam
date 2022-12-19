<?php
header('Allow: GET');
header('Content-Type: application/zip');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 405 Method Not Allowed');
    header('Content-Type: application/json');
    echo '{"status": "error", "message": "Allowed methods are: { GET }"}';
    exit;
}

define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'artifact.php');

(new Artifact())->zip();

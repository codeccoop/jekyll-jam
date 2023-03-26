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

try {
    $latest = (new Artifact())->zip();
    header('Content-disposition: attachment;filename=latest.zip');
    header("Content-Length: " . filesize($latest));
    readfile($latest);
    exit();
} catch (Exception $e) {
    echo $e->getMessage();
    switch ($e->getCode()) {
        case 404:
            header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
            header('Content-Type: application/json');
            echo '{"status": "error", "message": "File not found"}';
            break;
        case 500:
            header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error');
            header('Content-Type: application/json');
            echo '{"status": "error", "message": "' . $e->getMessage() . '"}';
            break;
    }
}

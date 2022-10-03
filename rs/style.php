<?php
header('Allow: GET');
header('Content-Type: application/json');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'style.php');

try {
    $style = new Style($_GET['sha']);
    echo json_encode(array(
        'url' => $style->get_url()
    ));
} catch (Exception $e) {
    echo '{"url": null}';
}

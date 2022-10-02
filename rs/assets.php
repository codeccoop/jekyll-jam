<?php
header('Allow: GET');
header('Content-Type: application/json');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'dotfile.php');

$env = (new Dotfile())->get();

if ($env['GH_DOMAIN'] == 'repo') {
    $url = 'http://' . $env['GH_USER'] . '.github.io/' . $env['GH_REPO'] . '/' . $_GET['path'];
} else {
    $url = $env['GH_DOMAIN'] . '/' . $_GET['path'];
}

$content = file_get_contents($url);

if ($content) {
    echo $content;
} else {
    http_response_code(404);
}

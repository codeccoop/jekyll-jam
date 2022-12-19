<?php
header('Allow: GET');
header('Content-Type: text/javascript');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'blocks.php');

try {
    echo (new Blocks($_GET['sha']))->get();
} catch (Exception $e) {
    echo '[{
        name: "Video",
        args: ["url", "width", "height"],
        selfClosed: true,
        fn: ({ url, width, height }) => `<video src="${url}" width="${width}" height="${height}" />`
    }]';
    /* header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found'); */
    /* header('Content-Type: application/json'); */
    /* echo '{"status": "error", "message": "Blocks js file not found"}'; */
}

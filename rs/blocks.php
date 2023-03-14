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
        family: "media",
        name: "CustomVideo",
        level: "block",
        args: ["url", "width", "height"],
        fn: ({ src, width, height }) => `<video src="${src || ""}" style="width: ${width || "500px"}; height: ${height || "auto"};" />`
    }, {
        family: "layout",
        name: "Columns",
        level: "block",
        args: [],
        fn: ({ content }) => `<div class="columns" style="display: flex">${content}</div>`
    }, {
        family: "layout",
        name: "Column",
        level: "block",
        args: ["span", "gutter"],
        fn: ({ span, gutter, content }) => `<div class="column" style="flex: ${span || 1}; padding: ${gutter || "0px"}">${content}</div>`
    }]';
    /* header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found'); */
    /* header('Content-Type: application/json'); */
    /* echo '{"status": "error", "message": "Blocks js file not found"}'; */
}

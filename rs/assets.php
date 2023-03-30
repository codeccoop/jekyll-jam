<?php
header('Allow: GET');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

// TODO: Dynamic MIM Types based on file extension
// header('Content-Type: ' . mime_content_type(basename($_GET['path'])));
header('Content-Type: text/css');

define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'dotfile.php');

$env = (new Dotfile())->get();

if (strpos($env['GH_DOMAIN'], 'github.io') !== false) {
    preg_match('/\.github\.io$/', $env['GH_REPO'], $match);
    $is_user_site = sizeof($match) > 0;
    if ($is_user_site) {
        $baseurl = '/';
    } else {
        $baseurl = '/' . $env['GH_REPO'];
    }
} else {
    $base_url = preg_replace('/\/$/', '', preg_replace('/^(.(?!\/))*.\/?/', '', preg_replace('/^https?\:\/\//', '', $env['GH_DOMAIN'])));
}

$url = 'http://' . $env['GH_DOMAIN'] . $base_url . '/' . $_GET['path'];


$content = file_get_contents($url);
echo mime_content_type($url);

if ($content) {
    echo $content;
} else {
    http_response_code(404);
}

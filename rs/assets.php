<?php
require_once realpath(__DIR__ . '/../lib/dotfile.php');

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

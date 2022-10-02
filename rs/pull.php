<?php
header('Allow: GET');
header('Content-Type: application/json');

if ('POST' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'repo.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'branch.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'pull.php');

$branch = (new Repo())->defaultBranch();
$pull = (new Pull())->post($branch);
$merge = (new Pull($pull['number']))->put();

echo json_encode($merge);

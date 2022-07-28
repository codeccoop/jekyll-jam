<?php
header('Allow: GET');
header('Content-Type: application/json');

if ('POST' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

require_once realpath(__DIR__ . '/../lib/branch.php');
require_once realpath(__DIR__ . '/../lib/pull.php');

$branch = (new Branch())->defaultBranch();
$pull = (new Pull())->post($branch);
$merge = (new Pull($pull['number']))->put();

echo json_encode($merge);

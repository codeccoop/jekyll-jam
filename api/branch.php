<?php
header('Allow: GET');
header('Content-Type: application/json');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

$file_path = realpath(__DIR__ . "/../static/data/branch.json");
$file = fopen($file_path, "r") or die("Unable to open file!");
echo fread($file, filesize($file_path));
fclose($file);
exit;

require_once realpath(__DIR__ . '/../lib/branch.php');

$branch = new Branch();
echo $branch->json();
# $data = $branch->get();
# echo json_encode($data);

<?php
header('Allow: POST');
header('Content-Type: application/json');

if ('POST' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

require_once realpath(__DIR__ . '/../lib/blob.php');
require_once realpath(__DIR__ . '/../lib/branch.php');
require_once realpath(__DIR__ . '/../lib/tree.php');
require_once realpath(__DIR__ . '/../lib/commit.php');
require_once realpath(__DIR__ . '/../lib/ref.php');

$payload = json_decode(file_get_contents('php://input'), true);
$path = base64_decode($payload['path']);
$filename = end(explode('/', $path));

$env = (new Dotfile())->get();

$blob = (new Blob(null, $path))->post($payload['content']);

$commit = (new Branch($env['GH_BRANCH']))->get()['commit'];

$tree = (new Tree())->post($commit['sha'], array(
    array(
        'path' => $path,
        'type' => 'blob',
        'mode' => '100644',
        'sha' => $blob['sha']
    )
));

$commit = (new Commit())->post(
    "Update {$filename} by Jekyll JAM",
    $commit['sha'],
    $tree['sha']
);

$ref = (new Ref())->post($commit['sha'], true);

echo '{';
echo '"blob": ' . json_encode($blob) . ',';
echo '"tree": ' . json_encode($tree) . ',';
echo '"commit": ' . json_encode($commit) . ',';
echo '"ref": ' . json_encode($commit);
echo '}';

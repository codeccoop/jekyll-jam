<?php
header('Allow: POST');
header('Content-Type: application/json');

if ('POST' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'blob.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'branch.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'tree.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'commit.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'ref.php');

$env = (new Dotfile())->get();

$payload = json_decode(file_get_contents('php://input'), true);

$changes = array();
foreach ($payload as $file) {
    $path = base64_decode($file['path']);
    $content = $file['content'];
    $blob = (new Blob(null, $path))->post($content);
    array_push($changes, array(
        'path' => $path,
        'type' => 'blob',
        'mode' => '100644',
        'sha' => $blob['sha']
    ));
}

$commit = (new Branch($env['GH_BRANCH']))->get()['commit'];

$tree = (new Tree())->post($commit['sha'], $changes);

$commit = (new Commit())->post(
    "Update {$filename} by Jekyll JAM",
    $commit['sha'],
    $tree['sha']
);

$ref = (new Ref())->post($commit['sha'], true);

echo '{';
echo '"changes": ' . json_encode($changes) . ',';
echo '"tree": ' . json_encode($tree) . ',';
echo '"commit": ' . json_encode($commit) . ',';
echo '"ref": ' . json_encode($commit);
echo '}';

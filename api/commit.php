<?php

require_once 'lib/blob.php';
require_once 'lib/tree.php';
require_once 'lib/commit.php';
require_once 'vendor/autoload.php';

use GuzzleHttp\Client;

$base_url = 'https://api.github.com';
$endpoint = '/repos/$GH_USER/$GH_REPO/git/blobs';

$blob = new Blob();
$blob_response = $blob->post($_POST['content']);

$tree = new Tree();
$tree_response = $tree->post('master', array(
    array(
        'path' => $_POST['path']
    )
))

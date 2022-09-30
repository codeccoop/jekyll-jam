<?php
header('Allow: GET');
header('Content-Type: application/json');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

require_once realpath(__DIR__ . '/../lib/dotfile.php');
require_once realpath(__DIR__ . '/../vendor/autoload.php');

use GuzzleHttp\Exception\ClientException;

$dotfile = new Dotfile();
$env = $dotfile->get();

if (!in_array('GH_INIT', array_keys($env))) {
    require_once realpath(__DIR__ . '/../lib/branch.php');
    require_once realpath(__DIR__ . '/../lib/repo.php');
    require_once realpath(__DIR__ . '/../lib/page.php');
    require_once realpath(__DIR__ . '/../lib/tree.php');

    $repo = new Repo();
    $branch = new Branch();
    try {
        $branch = $branch->get();
    } catch (ClientException $e) {
        $default = (new Branch($repo->defaultBranch()))->get();
        $branch = $branch->post($default['commit']['sha']);
    }

    $page = new Page();
    try {
        $page->get();
    } catch (ClientException $e) {
        $page->post(($branch->get())['name']);
    }

    $tree = (new Tree($branch['commit']['sha']))->get();
    $config = new Config($tree);
    $settings = $config->get();

    if ($env['GH_DOMAIN'] == 'repo') {
        if (!in_array('baseurl', array_keys($settings))) {
            $config->put('baseurl', '/' . $env['GH_REPO']);
        } else if (preg_replace('/(^\/|\/$)/', '', $settings['baseurl']) != $env['GH_REPO']) {
            $config->put('baseurl', '/' . $env['GH_REPO']);
        }
    } else {
        $base_url = preg_replace('/(^\/|\/$)/', '', preg_replace('/^[^\/]+\/?/', '', preg_replace('/^https?\:\/\//', '', $env['GH_DOMAIN'])));
        if (!in_array('baseurl', array_keys($settings))) {
            $config->put('baseurl', '/' . $base_url);
        } else if (preg_replace('/(^\/|\/$)/', '', $settings['baseurl']) != $base_url) {
            $config->put('baseurl', '/' . $base_url);
        }
    }

    $dotfile->post('GH_INIT', true);
}

echo '{"success": true}';

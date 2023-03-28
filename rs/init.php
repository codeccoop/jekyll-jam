<?php
header('Allow: GET');
header('Content-Type: application/json');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header('HTTP/1.1 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Exception\ClientException;

$dotfile = new Dotfile();
$env = $dotfile->get();

if (!in_array('GH_INIT', array_keys($env))) {
    require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'branch.php');
    require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'repo.php');
    require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'page.php');
    require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'tree.php');

    $repo = new Repo();
    try {
        $repo->get();
    } catch (ClientException $e) {
        if ($e->getCode() === 404) {
            $template = isset($env['GH_TEMPLATE']) ? $env['GH_TEMPLATE'] : false;
            $repo->post($env['GH_REPO'], $template);
        } else {
            throw $e;
        }
    }

    $branch = new Branch();
    try {
        $branch = $branch->get();
    } catch (ClientException $e) {
        if ($e->getCode() === 404) {
            $default = (new Branch($repo->defaultBranch()))->get();
            // TODO: AIxò no ha acabat de funcionar
            $branch = $branch->post($default['commit']['sha']);
        } else {
            throw $e;
        }
    }

    $page = new Page();
    try {
        $page->get();
    } catch (ClientException $e) {
        if ($e->getCode() === 404) {
            $page->post(($branch->get())['name']);
        } else {
            throw $e;
        }
    }

    $tree = (new Tree($branch['commit']['sha']))->get();
    $config = new Config($tree);
    $settings = $config->get();

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

    $settings['baseurl'] = $baseurl;
    (new Config($tree))->put($settings);

    $dotfile->post(array('GH_INIT' => true));
}

echo '{"success": true}';

<?php
define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'blob.php');
require_once realpath(__DIR__ . DS . 'config.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');
require_once realpath(__DIR__ . DS . 'cache.php');

use GuzzleHttp\Client;

class Tree
{
    public $sha;
    private $_config;
    private $env;
    private $cache;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/git/trees';

    function __construct($sha = null)
    {
        $this->sha = $sha;
        $this->env = (new Dotfile())->get();
        $this->cache = new Cache('tree', $sha);
        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
        if ($this->cache->is_cached()) return $this->cache->get();

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint . '/' . $this->sha . '?recursive=1', array(
            'headers' => array(
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN'],
                'Accept' => 'application/vnd.github+json',
            )
        ));
        $data = json_decode($response->getBody()->getContents(), true);
        return $this->cache->post($data);
    }

    public function post($base_sha, $changes)
    {
        $payload = array(
            'base_tree' => $base_sha,
            'tree' => $changes
        );

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('POST', $this->endpoint, array(
            'json' => $payload,
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $data = json_decode($response->getBody()->getContents(), true);
        return $this->cache->post($data);
    }

    public function json()
    {
        $tree = $this->_build_tree();
        $data = array(
            'sha' => $tree['sha'],
            'children' => $this->_json($tree)
        );

        return json_encode($data);
    }

    private function _json($tree)
    {
        $items = array();
        foreach ($tree['children'] as $name => $node) {
            $item = array();
            $item['name'] = $name;
            $item['sha'] = $node['sha'];
            $item['path'] = $node['path'];
            $item['is_file'] = $node['mode'] != '040000' && sizeof($node['children']) == 0;

            $item['children'] = $this->_json($node);
            array_push($items, $item);
        }

        return $items;
    }

    private function _build_tree()
    {
        $items = $this->get()['tree'];

        $tree = array('children' => array());
        foreach ($items as $item) {
            $path = explode('/', $item['path']);
            $path_length = count($path);

            $node = &$tree;
            for ($i = 0; $i < $path_length; $i++) {
                $level = $path[$i];
                if (!in_array($level, array_keys($node['children']))) {
                    $node['children'][$level] = array('children' => array());
                }
                $node = &$node['children'][$level];
            }

            foreach ($item as $key => $value) {
                $node[$key] = $value;
            }
        }

        return $this->_prune_tree($tree);
    }

    private function _prune_tree($tree)
    {
        $config = $this->config();
        $paths = array(
            '_posts',
            '_drafts',
        );

        if (in_array('collections', $config)) {
            foreach ($config['collections'] as $coll => $values) {
                if (in_array('collections_dir', $config)) {
                    array_push($paths, preg_replace('/\/$/', '', $config['collections_dir']) . '/' . $coll);
                } else {
                    array_push($paths, $coll);
                }
            }
        }

        $children = array();
        foreach (array_keys($tree['children']) as $name) {
            if ($tree['children'][$name]['type'] == 'blob' || in_array($name, $paths)) {
                array_push($children, $tree['children'][$name]);
            }
        }

        $children = array_filter($children, array($this, '_prune_branch'));
        $named_children = array();
        foreach ($children as $child) {
            foreach ($tree['children'] as $name => $node) {
                if ($node['sha'] == $child['sha']) {
                    $named_children[preg_replace('/^_/', '', $name)] = $node;
                }
            }
        }

        if (in_array('_data', array_keys($tree['children']))) {
            $data['children'] = array_filter($tree['children']['_data']['children'], function ($node) {
                return $this->_prune_branch($node, "yml");
            });
            $named_children['data'] = $data;
        }

        if (in_array('assets', array_keys($tree['children']))) {
            $named_children['assets'] = $tree['children']['assets'];
        }
        $tree['children'] = $named_children;

        return $tree;
    }

    private function _prune_branch($node, $file_type = "md")
    {
        if ($node['type'] == 'blob') {
            return preg_match('/\.' . $file_type . '$/', $node['path']);
        }
        $children = array_filter($node['children'], array($this, '_prune_branch'));
        $named_children = array();
        foreach ($children as $child) {
            foreach ($node['children'] as $name => $_node) {
                if ($_node['sha'] == $child['sha']) {
                    $named_children[preg_replace('/^_/', '', $name)] = $node;
                }
            }
        }
        $node['children'] = $named_children;
        return true;
    }

    public function config()
    {
        if ($this->_config) {
            return $this->_config;
        }

        $this->_config =  (new Config($this->get()))->get();
        return $this->_config;
    }
}

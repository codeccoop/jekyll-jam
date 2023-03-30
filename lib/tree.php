<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'blob.php');
require_once realpath(__DIR__ . DS . 'config.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');
require_once realpath(__DIR__ . DS . 'cache.php');

use GuzzleHttp\Client;

class Tree
{
    public $sha;
    private $data;
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
        if ($this->data) return $this->data;
        if ($this->cache->is_cached()) $this->cache->get();

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint . '/' . $this->sha . '?recursive=1', array(
            'headers' => array(
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN'],
                'Accept' => 'application/vnd.github+json',
            )
        ));
        $this->data = json_decode($response->getBody()->getContents(), true);
        return $this->cache->post($this->data);
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

        $this->data = json_decode($response->getBody()->getContents(), true);
        return $this->cache->post($this->data);
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
        $data = $this->get();
        $items = $data['tree'];

        $tree = array('children' => []);
        for ($i = 0; $i < sizeof($items); $i++) {
            $item = $items[$i];
            $path = explode('/', $item['path']);
            $path_length = sizeof($path);

            $node = &$tree;
            for ($j = 0; $j < $path_length; $j++) {
                $level = $path[$j];
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
        $config = (new Config($this->get()))->get();

        $paths = array(
            '_posts',
            '_drafts',
        );

        if (isset($config['collections'])) {
            foreach (array_keys($config['collections']) as $coll) {
                if (isset($config['collections_dir'])) {
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
            $data = $tree['children']['_data'];
            $data['children'] = array_filter($data['children'], function ($node) {
                return $this->_prune_branch($node, ["yml"]);
            });
            $named_children['data'] = $data;
        }

        if (in_array('assets', array_keys($tree['children']))) {
            $assets = $tree['children']['assets'];
            $assets['children'] = array_filter($assets['children'], function ($node) {
                return $this->_prune_branch($node, ['png', 'jpg', 'jpeg', 'webp', 'tif', 'tiff', 'jpe', 'gif', 'svg', 'bmp', 'ico', 'svgz']);
            });
            /* $assets['children'] = array_filter($assets['children'], function ($node) { */
            /*     $invalid_extensions = ['sass', 'scss', 'css', 'htm', 'html', 'js', 'json', 'yml', 'yaml', 'md', 'makrdown']; */
            /*     if (isset($node['path'])) { */
            /*         $filename = basename($node['path']); */
            /*         $ext = strtolower(end(explode('.', $filename))); */
            /*         return $filename !== 'vocero.scss' and in_array($ext, $invalid_extensions) === false; */
            /*     } */
            /* }); */
            $named_children['assets'] = $assets;
        }
        $tree['children'] = $named_children;
        $tree['is_file'] = false;

        return $tree;
    }

    private function _match_extension($path, $ext)
    {
        return preg_match('/\.' . $ext . '$/', $path);
    }

    private function _prune_branch($node, $file_types = ["md"])
    {
        if ($node['type'] == 'blob') {
            return array_reduce($file_types, function ($carry, $ext) use ($node) {
                return $carry || $this->_match_extension($node['path'], $ext);
            }, false);
            // return preg_match('/\.' . $file_type . '$/', $node['path']);
        }
        $children = array_filter($node['children'], function ($node) use ($file_types) {
            return $this->_prune_tree($node, $file_types);
        }); // array($this, '_prune_branch'));
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

    public function find_file($sha)
    {
        $tree = $this->get()['tree'];
        $file = array_pop(array_filter($tree, function ($file) use ($sha) {
            return $file['sha'] === $sha;
        }));

        return $file;
    }

    /* private function _traverse_tree($node, $files = []) */
    /* { */
    /*     if ($node['type'] === 'blob') { */
    /*         $files[] = $node; */
    /*     } else { */
    /*         foreach ($node['children'] as $child) { */
    /*             if ($node['type'] === 'blob') { */
    /*                 $files[] = $child; */
    /*             } else { */
    /*                 $files = $this->_traverse_tree($child, $files); */
    /*             } */
    /*         } */
    /*     } */

    /*     return $files; */
    /* } */
}

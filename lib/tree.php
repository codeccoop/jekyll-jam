<?php
require_once realpath(__DIR__ . '/dotfile.php');
require_once realpath(__DIR__ . '/blob.php');
require_once realpath(__DIR__ . '/../vendor/autoload.php');

use GuzzleHttp\Client;
use Symfony\Component\Yaml\Yaml;

class Tree
{
    public $sha = null;
    public $data = null;
    private $_config = null;
    private $env = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/git/trees';

    function __construct($sha = null)
    {
        $this->sha = $sha;
        $this->env = (new Dotfile())->get();
        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
        if ($this->data) {
            return $this->data;
        }

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint . '/' . $this->sha . '?recursive=1', array(
            'headers' => array(
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN'],
                'Accept' => 'application/vnd.github+json',
            )
        ));
        $json = json_decode($response->getBody()->getContents(), true);
        $this->data = $json;
        return $json;
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

        return json_decode($response->getBody()->getContents(), true);
    }

    public function render()
    {

        $tree = $this->_build_tree();
        echo '<ul>Directory Tree';
        $this->_render($tree);
        echo '</ul>';
    }

    private function _render($tree)
    {
        foreach ($tree['children'] as $name => $node) {
            $url_path = base64_encode($node['path']);
            switch ($node['mode']) {
                case '040000':
                    echo "<li>{$name}<ul>";
                    break;
                case '100644':
                    echo "<li><a href='/editor.php?sha={$node['sha']}&path={$url_path}'>{$name}</a>";
                    break;
                case '100755':
                    echo "<li><a href='/editor.php?sha={$node['sha']}&path={$url_path}'>{$name}</a>";
                    break;
            }

            $this->_render($node);

            switch ($node['mode']) {
                case '040000':
                    echo '</ul></li>';
                    break;
                case '100644':
                    echo '</li>';
                    break;
                case '100755':
                    echo '</li>';
                    break;
            }
        }
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
            foreach ($config['collections'] as $coll => $config) {
                if (in_array('collections_dir', $coll)) {
                    array_push($paths, $config['collections_dir']);
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
        $tree['children'] = $named_children;

        return $tree;
    }

    private function _prune_branch($node)
    {
        if ($node['type'] == 'blob') {
            return preg_match('/\.md$/', $node['path']);
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

        $tree = $this->get()['tree'];
        foreach ($tree as $node) {
            if ($node['path'] == '_config.yml') {
                $blob = (new Blob($node['sha']))->get();
                $this->_config = Yaml::parse(base64_decode($blob['content']));
            }
        }

        return $this->_config;
    }
}

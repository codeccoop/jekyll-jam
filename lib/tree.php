<?php

require_once 'lib/dotfile.php';
require_once 'vendor/autoload.php';

use GuzzleHttp\Client;

class Tree
{
    public $sha = null;
    private $env = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/git/trees';

    function __construct($sha = null)
    {
        $this->sha = $sha;
        $this->env = (new Dotenv())->get();
        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get($sha = null)
    {
        $_sha = $sha == null ? $this->sha : $sha;
        if (!$_sha) {
            throw new TypeError('Invalid commit sha');
        }

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint . '/' . $_sha . '?recursive=1');
        $json = json_decode($response->getBody()->getContents(), true);
        return $json;
    }

    public function post($base_tree_sha, $changes)
    {
        $payload = array(
            'base_tree' => $base_tree_sha,
            'tree' => $changes
        );

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('POST', $this->endpoint, array(
            'body' => $payload,
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));
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
            switch ($node['mode']) {
                case '040000':
                    echo "<li>{$name}<ul>";
                    break;
                case '100644':
                    echo "<li><a href='/editor.php?sha={$node['sha']}&filename={$name}'>{$name}</a>";
                    break;
                case '100755':
                    echo "<li><a href='/editor.php?sha={$node['sha']}&filename={$name}'>{$name}</a>";
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

        return $tree;
    }
}

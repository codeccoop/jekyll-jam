<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'blob.php');
require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . 'tree.php');

class Blocks
{
    // private $env;
    private $blob;
    private $cache;
    private $tree;
    private $path;
    private $sha;

    function __construct($tree_sha)
    {
        $this->env = (new Dotfile())->get();

        $this->tree = (new Tree($tree_sha))->get();
        $node = $this->get_node($this->tree['tree']);

        if ($node) {
            $this->sha = $node['sha'];
            $this->path = $node['path'];
        } else {
            throw new Exception('can\'t find style file');
        }

        $this->cache = new Cache('blocks', $this->sha);
        $this->blob = new Blob($this->sha, $this->path);
    }

    private function get_node($nodes)
    {
        return array_reduce($nodes, function ($carry, $node) {
            if ($carry !== null) return $carry;
            if (preg_match('/blocks.js$/', $node['path'])) {
                return $node;
            }
            return null;
        }, null);
    }

    public function get()
    {
        if ($this->cache->is_cached()) return $this->cache->get();

        $data = $this->blob->get();
        return $this->cache->post($data);
    }
}

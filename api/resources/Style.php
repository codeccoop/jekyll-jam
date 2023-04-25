<?php

require_once VOCERO_API_ROOT . 'resources/Blob.php';

class Style extends Blob
{
    public static string $path = 'assets/vocero.scss';

    public function __construct(string $sha)
    {
        parent::__construct($sha, Style::$path);
    }

    public function get_public_url()
    {
        if ($this->env['GH_DOMAIN'] === 'repo') {
            $domain = 'https://' . $this->env['GH_USER'] . '.github.io/' . $this->env['GH_REPO'];
        } else {
            $domain = 'https://' . $this->env['GH_DOMAIN'];
        }

        $filepath = preg_replace('/\.scss$/', '.css', $this->path);
        return b64e($domain . '/' . $filepath);
    }

    static function get_tree_node(array $tree): ?array
    {
        $nodes = array_values(array_filter($tree['tree'], function ($node) {
            return $node['path'] == Style::$path;
        }));

        if (count($nodes) > 0) {
            return $nodes[0];
        }

        return null;
    }
}

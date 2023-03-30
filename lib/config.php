<?php
require_once realpath(__DIR__ . DS . 'blob.php');
require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use Symfony\Component\Yaml\Yaml;

class Config
{
    private $path = '_config.yml';
    private $blob;
    private $cache;
    private $default_path;

    function __construct($tree)
    {
        $this->default_path = realpath(__DIR__ . DS . '..' . DS . 'static' . DS . 'data' . DS . 'default_config.yml');

        $node = array_values(array_filter($tree['tree'], function ($node) {
            return $node['path'] == '_config.yml';
        }))[0];

        $this->cache = new Cache('config', $node['sha']);
        $this->blob = new Blob($node['sha'], $this->path);
    }

    public function get()
    {
        if ($this->cache->is_cached()) return $this->cache->get();

        $data = $this->blob->get();
        return $this->cache->post($data);
    }

    public function post()
    {
        $file = fopen($this->default_path, 'r');
        $content = fread($file, filesize($this->default_path));
        $data = $this->blob->post($content);
        return $this->cache->post($data);
    }

    public function put($entries)
    {
        $data = $this->get();
        foreach ($entries as $key => $val) {
            $data[$key] = $val;
        }
        $content = Yaml::dump($data);
        $data = $this->blob->post($content);
        return $this->cache->post($data);
    }

    public function parsed()
    {
        return Yaml::parse($this->content());
    }

    public function json()
    {
        return json_encode($this->parsed());
    }

    public function yaml()
    {
        return $this->content();
    }

    private function content()
    {
        $blob = $this->get();

        if ($blob['encoding'] == 'base64') {
            $decoded = base64_decode($blob['content']);
        } else {
            $decoded = 'Unkown encoding';
        }

        return $decoded;
    }
}

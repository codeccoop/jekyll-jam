<?php
require_once realpath(__DIR__ . '/blob.php');
require_once realpath(__DIR__ . '/../vendor/autoload.php');

use Symfony\Component\Yaml\Yaml;

class Config
{
    private $path = '_config.yml';
    private $blob = null;

    function __construct($tree)
    {
        $node = array_values(array_filter($tree['tree'], function ($node) {
            return $node['path'] == '_config.yml';
        }))[0];
        $this->blob = new Blob($node['sha'], $this->path);
    }

    public function get()
    {
        if ($this->data) {
            return $this->data;
        }

        $this->data = $this->blob->get();
        return $this->data;
    }

    public function json()
    {
        $response = Yaml::parse($this->content());
        return json_encode($response);
    }

    public function yaml()
    {
        return $this->content();
    }

    public function put($key, $value)
    {
        $data = $this->get();
        $data[$key] = $value;
        $content = Yaml::dump($data);
        $data = $this->blob->post($content);
        return $data;
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

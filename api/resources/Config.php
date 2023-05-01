<?php
require_once VOCERO_API_ROOT . 'resources/Blob.php';

use Symfony\Component\Yaml\Yaml;

class Config extends Blob
{
    public array $methods = ['GET', 'POST', 'PATCH'];

    public static $path = '_config.yml';
    private $default_path = VOCERO_API_ROOT . 'static/data/default_config.yml';

    public function __construct($sha)
    {
        parent::__construct($sha, Config::$path);
    }

    public function put($payload = null)
    {
        return $this->request('POST', $payload);
    }

    public function get_payload($method, $data = null)
    {
        $data = parent::get_payload($method, $data);
        if (!$data) return null;

        if ($method === 'POST' && $_SERVER['REQUEST_METHOD'] === $method) {
            $file = fopen($this->default_path, 'r');
            $content = fread($file, filesize($this->default_path));
            fclose($file);
        } else if ($method === 'POST' && $_SERVER['REQUEST_METHOD'] !== $method) {
            $data = $this->get();
            foreach ($data as $key => $val) {
                $data[$key] = $val;
            }
            $content = Yaml::dump($data);
        }

        return [
            'encoding' => 'base64',
            'content' => $content,
        ];
    }

    protected function decorate($data = null)
    {
        return Yaml::parse($this->content());
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

    static function get_tree_node($tree)
    {
        $nodes = array_values(array_filter($tree['tree'], function ($node) {
            return $node['path'] == Config::$path;
        }));

        if (count($nodes) > 0) {
            return $nodes[0];
        }

        return null;
    }
}

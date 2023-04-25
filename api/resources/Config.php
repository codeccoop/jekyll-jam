<?php
require_once VOCERO_API_ROOT . 'resources/Blob.php';

use Symfony\Component\Yaml\Yaml;

class Config extends Blob
{
    public static array $methods = ['GET', 'POST', 'PATCH'];

    public static string $path = '_config.yml';
    private string $default_path = VOCERO_API_ROOT . 'static/data/default_config.yml';

    public function __construct(string $sha)
    {
        parent::__construct($sha, Config::$path);
    }

    public function put(?array $payload = null): array
    {
        return $this->request('POST', $payload);
    }

    public function get_payload(string $method, ?array $data = null): ?array
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

    protected function decorate(?array $data = null): array
    {
        return Yaml::parse($this->content());
    }

    public function yaml(): string
    {
        return $this->content();
    }

    private function content(): string
    {
        $blob = $this->get();

        if ($blob['encoding'] == 'base64') {
            $decoded = base64_decode($blob['content']);
        } else {
            $decoded = 'Unkown encoding';
        }

        return $decoded;
    }

    static function get_tree_node(array $tree): ?array
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

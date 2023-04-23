<?php
require_once VOCERO_API_ROOT . 'resources/Blob.php';

use Symfony\Component\Yaml\Yaml;

class Config extends Blob
{
    public static array $methods = ['GET', 'POST', 'PATCH'];

    private string $path = '_config.yml';
    private string $default_path = VOCERO_API_ROOT . 'static/data/default_config.yml';

    public function __construct(string $sha)
    {
        parent::__construct($sha, $this->path);
    }

    public function req_payload(string $method): array
    {
        $output = [
            'encoding' => 'base64',
            'content' => null,
        ];

        if ($method === 'POST') {
            $file = fopen($this->default_path, 'r');
            $output['content'] = fread($file, filesize($this->default_path));
            fclose($file);
        } else if ($method === 'PATCH') {
            $data = $this->get();
            foreach ($this->req['payload'] as $key => $val) {
                $data[$key] = $val;
            }
            $output['content'] = Yaml::dump($data);
        }

        return $output;
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
}

<?php
require_once VOCERO_API_ROOT . 'resources/BaseResource.php';
require_once VOCERO_API_ROOT . 'resources/Tree.php';
require_once VOCERO_API_ROOT . 'lib/Link.php';
require_once VOCERO_API_ROOT . 'lib/helpers.php';

use Symfony\Component\Yaml\Yaml;
use Spatie\YamlFrontMatter\YamlFrontMatter;

class BlobCache extends Cache
{
    private Cache $branch;

    public function __construct(string $file_path, string $sha = null)
    {
        parent::__construct($file_path, $sha);
        $this->branch = new Cache('branch');
    }

    public function is_cached(): bool
    {
        if (!parent::is_cached()) return false;
        if (!$this->branch->is_cached()) return false;

        $branch = $this->branch->get();
        $tree = new Tree($branch['commit']['sha']);

        $cache = parent::get();
        $file = $tree->find_file($cache['sha']);
        return $file['sha'] === $cache['sha'];
    }
}

class Blob extends BaseResource
{
    protected string $cache_key = 'blobs';
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO/git/blobs';

    private string $type;
    private string $path;

    public function __construct(?string $sha = null, string $path)
    {
        $this->sha = $sha;
        $this->path = $path;

        $this->cache_key = $this->cache_key . '/' . $this->path;

        if (preg_match('/^assets\/.+/', $this->path)) $this->type = 'asset';
        else if (preg_match('/\.(markdown|mkdown|mkdn|mkd|md)$/', $this->path)) $this->type = 'markdown';
        else if (preg_match('/\.(yml|yaml)$/', $this->path)) $this->type = 'yaml';
        else $this->type = 'unkown';
        // else throw new Exception("Unkown blob type", 400);

        $this->cache = new BlobCache($this->cache_key, $this->sha);

        parent::__construct();
    }

    public function post(?array $payload = null): array
    {
        $sha = parent::post($payload)['sha'];
        $this->cached && $this->cache->truncate();
        return (new Blob($sha, $this->path))->get();
    }

    protected function decorate(): array
    {
        $data = $this->get();

        $output = [
            'sha' => $data['sha'],
            'path' => base64_encode($this->path),
            'frontmatter' => $this->get_frontmatter(),
            'content' => $this->get_content()
        ];

        if ($this->type = 'asset') {
            $output['encoding'] = $data['encoding'];
        } else {
            $output['encoding'] = 'base64';
        }

        return $output;
    }

    protected function get_payload(string $method, ?array $data = null): ?array
    {
        $data = parent::get_payload($method, $data);
        if (!$data) return null;

        if ($data['encoding'] == 'base64') {
            if ($this->type === 'markdown') {
                $content = $this->absolute_links($data['content']);

                if ($data['frontmatter'] !== null && sizeof($data['frontmatter']) > 0) {
                    $frontmatter = '---' . PHP_EOL . Yaml::dump($data['frontmatter']) . '---' . PHP_EOL . PHP_EOL;
                } else {
                    $frontmatter = '---' . PHP_EOL . '---' . PHP_EOL . PHP_EOL;
                }
                $content = $frontmatter . $content;
            } else {
                $content = $data['content'];
            }

            $content = base64_encode($content);
        }

        return [
            'content' => $content,
            'encoding' => $data['encoding']
        ];
    }

    protected function get_endpoint(string $method): string
    {
        switch ($method) {
            case 'GET':
                return $this->endpoint . '/' . $this->sha;
            default:
                return $this->endpoint;
        }
    }

    private function relative_links(string $content)
    {
        return preg_replace('/{{\s*site\.baseurl\s*}}/', '', $content);
    }

    private function absolute_links($content): string
    {
        $replace = fn ($link) => str_replace($link->source, $link->as_absolute(), $content);

        foreach (Link::get_links($content) as $link) {
            foreach ($link->get_children() as $sublink) {
                $content = $replace($sublink);
            }

            $content = $replace($link);
        }

        foreach (HLink::get_hlinks($content) as $hlink) {
            $content = $replace($hlink);
        }

        return $content;
    }

    private function get_content(): string
    {
        $blob = $this->get();
        $encoding = $blob['encoding'];

        if ($encoding == 'base64') {
            if ($this->type === 'asset') {
                $content = $blob['content'];
            } else {
                $decoded = base64_decode($blob['content']);

                if ($this->type == 'yaml') {
                    $content = json_encode(Yaml::parse($decoded), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                } else {
                    $parsed = YamlFrontMatter::parse($decoded);
                    $content = $this->relative_links($parsed->body());
                }

                $content = base64_encode($content);
            }
        } else {
            throw new Exception('Unkown encoding ' . $encoding, 500);
        }

        return $content;
    }

    private function get_frontmatter(): array
    {
        $blob = $this->get();
        $encoding = $blob['encoding'];

        if ($encoding == 'base64') {
            if (!$this->type === 'markdown') {
                return [];
            }
            $decoded = base64_decode($blob['content']);
        } else {
            return [];
        }

        $parsed = YamlFrontMatter::parse($decoded);
        return $parsed->matter();
    }
}

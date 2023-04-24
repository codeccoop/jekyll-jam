<?php
require_once VOCERO_API_ROOT . 'resources/BaseResource.php';
require_once VOCERO_API_ROOT . 'resources/Tree.php';
require_once VOCERO_API_ROOT . 'lib/Link.php';

use Symfony\Component\Yaml\Yaml;

class Blob extends BaseResource
{
    static array $methods = ['GET', 'POST'];

    protected string $cache_key = 'blobs';
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO/git/blobs';

    private string $type;
    private string $path;
    private ?array $payload = null;

    public function __construct(string $sha, string $path, ?array $payload = null)
    {
        $this->sha = $sha;
        $this->path = $path;
        if ($payload) {
            $this->payload = $payload;
        }

        $this->cache_key = $this->cache_key . '/' . $this->path;

        if (preg_match('/^assets/', $this->path)) $this->type = 'asset';
        else if (preg_match('/\.(markdown|mkdown|mkdn|mkd|md)$/', $this->path)) $this->type = 'markdown';
        else if (preg_match('/\.(yml|yaml)$/', $this->path)) $this->type = 'yaml';
        else throw new Exception("Unkown blob type", 400);

        parent::__construct();

        $this->cache->get = function () {
            return $this->get_cached();
        };
    }

    private function relative_links(string $content)
    {
        return preg_replace('/{{\s*site\.baseurl\s*}}/', '', $content);
    }

    private function absolute_links($content)
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

    public function get_cached()
    {
        $branch_cache = new Cache('branch');
        if (!$branch_cache->is_cached()) return;

        $branch = $branch_cache->get();
        $tree = new Tree($branch['commit']['sha']);

        if ($this->cache->is_cached()) {
            $cache = $this->cache->get();
            $file = $tree->find_file($cache['sha']);
            if ($file['sha'] === $cache['sha']) {
                $this->data = $cache;
                return $this->data;
            }
        }
    }

    protected function get_payload(string $method): ?array
    {
        if ($this->payload['encoding'] == 'base64') {
            if ($this->type === 'markdown') {
                $content = $this->absolute_links($this->payload['content']);
            }

            if ($this->payload['frontmatter'] !== null && sizeof($this->payload['frontmatter']) > 0) {
                $content = '---' . PHP_EOL . Yaml::dump($this->payload['frontmatter']) . '---' . PHP_EOL . PHP_EOL . $content;
            }

            $content = base64_encode($content);
        }

        $output = [
            'content' => $content,
            'encoding' => $this->payload['encoding']
        ];

        return $output;
    }

    protected function decorate(?array $data = null): array
    {
        $data = parent::decorate($data);
        $output = [
            'array' => $data['sha'],
            'path' => $this->path,
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

    private function get_content()
    {
        $blob = $this->get();
        $encoding = $blob['encoding'];

        if ($encoding == 'base64') {
            if ($this->type == 'asset') {
                $content = $blob['content'];
            } else {
                $decoded = base64_decode($blob['content']);

                if ($this->type == 'yaml') {
                    $content = json_encode(Yaml::parse($decoded));
                } else {
                    $content = $this->relative_links(preg_replace('/^(\n|\r)*---\n[^-{3}]+\n---\n*/', '', $decoded));
                }

                $content = base64_encode($content);
            }
        } else {
            throw new Exception('Unkown encoding ' . $encoding, 500);
        }

        return $content;
    }

    private function get_frontmatter()
    {
        $blob = $this->get();
        $encoding = $blob['encoding'];

        if ($encoding == 'base64') {
            if (!$this->type === 'markdown') {
                return;
            }
            $decoded = base64_decode($blob['content']);
        } else {
            return;
        }

        preg_match('/^(\n|\r)*---\n([^-{3}]+)\n---\n*/', $decoded, $matches);
        if (sizeof($matches) > 0) {
            return Yaml::parse($matches[1]);
        } else {
            return [];
        }
    }
}

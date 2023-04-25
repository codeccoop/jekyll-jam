<?php

require_once VOCERO_API_ROOT . 'resources/BaseResource.php';

class Commit extends BaseResource
{
    public string $endpoint = '/repos/$GH_USER/$GH_REPO/git/commits';

    protected string $cache_key = 'commit';

    public function __construct(?string $sha = null)
    {
        $this->sha = $sha;
        parent::__construct();
    }

    public function get(): array
    {
        if ($this->cache->is_cached()) return $this->cache->get();

        if (!$this->sha) {
            throw new TypeError("Invalid commit sha", 400);
        }

        return parent::get();
    }

    protected function get_payload(string $method, ?array $data = null): ?array
    {
        $data = parent::get_payload($method, $data);
        if (!$data) return null;

        $output = null;
        if ($method === 'POST') {
            $output = [
                'message' => $data['message'],
                'author' => [
                    'name' => $this->env['GH_USER'],
                    'email' => $this->env['GH_EMAIL'],
                    'date' => date('c'),
                ],
                'parents' => [$data['parent_sha']],
                'tree' => $data['tree_sha'],
            ];
        }

        return $output;
    }

    protected function get_endpoint(string $method): string
    {
        switch ($method) {
            case 'GET':
                return $this->endpoint . '/' . $this->sha;
            case 'POST':
                return $this->endpoint;
        }
    }
}

<?php

require_once VOCERO_API_ROOT . 'resources/BaseResource.php';

class Commit extends BaseResource
{
    public $endpoint = '/repos/$GH_USER/$GH_REPO/git/commits';

    protected $cache_key = 'commit';

    public function __construct($sha = null)
    {
        $this->sha = $sha;
        parent::__construct();
    }

    public function get()
    {
        if ($this->cache->is_cached()) return $this->cache->get();

        if (!$this->sha) {
            throw new TypeError("Invalid commit sha", 400);
        }

        return parent::get();
    }

    protected function get_payload($method, $data = null)
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

    protected function get_endpoint($method)
    {
        switch ($method) {
            case 'GET':
                return $this->endpoint . '/' . $this->sha;
            case 'POST':
                return $this->endpoint;
        }
    }
}

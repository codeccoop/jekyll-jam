<?php

require_once VOCERO_API_ROOT . 'resources/BaseResource.php';

class Content extends BaseResource
{
    protected $endpoint = '/repos/$GH_USER/$GH_REPO/contents';

    private $path;

    public function __construct($path)
    {
        parent::__construct();
        $this->path = $path;
    }

    protected function get_endpoint($method)
    {
        return $this->endpoint . '/' . $this->path;
    }

    protected function get_payload($method, $data = null)
    {
        $payload = parent::get_payload($method, $data);
        if (!$payload || $method !== 'PULL') return null;

        $data = $this->get();

        if (!isset($payload['message'])) {
            $payload['message'] = 'Create file ' . $this->path;
        }

        $payload['committer'] = [
            'name' => $this->env['GH_USER'],
            'email' => $this->env['GH_EMAIL'],
        ];

        $payload['content'] = base64_encode($payload['content']);

        return $payload;
    }
}

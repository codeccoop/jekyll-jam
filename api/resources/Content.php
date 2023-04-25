<?php

require_once VOCERO_API_ROOT . 'resources/BaseResource.php';

class Content extends BaseResource
{
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO/contents';

    private string $path;

    public function __construct(string $path)
    {
        parent::__construct();
        $this->path = $path;
    }

    protected function get_endpoint(string $method): string
    {
        return $this->endpoint . '/' . $this->path;
    }

    protected function get_payload(string $method, ?array $data = null): ?array
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

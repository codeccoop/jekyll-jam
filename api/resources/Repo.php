<?php
require_once VOCERO_API_ROOT . 'resources/BaseResource.php';

class Repo extends BaseResource
{
    public static array $methods = ['GET', 'POST'];

    protected string $cache_key = 'repo';
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO';

    private ?string $template_slug = null;

    public function __construct()
    {
        parent::__construct();
    }

    protected function get_endpoint(string $method): string
    {
        switch ($method) {
            case 'POST':
                return $this->template_url();
            default:
                return $this->endpoint;
        }
    }

    protected function get_payload(string $method, ?array $data = null): ?array
    {
        $data = parent::get_payload($method, $data);
        if (!$data || $method !== 'POST') return null;

        $payload = [
            'name' => $data['name'],
            'description' => 'This is a Vocero site',
            'private' => false,
        ];

        if (isset($data['template_slug']) && $data['template_slug']) {
            $this->template_slug = $data['template_slug'];
            $payload['owner'] = $this->env['GH_USER'];
            $payload['include_all_branches'] = false;
        }

        return $payload;
    }

    public function default_branch(): string
    {
        $data = $this->get();
        return $data['default_branch'];
    }

    private function template_url()
    {
        list($owner, $repo) = explode('/', $this->template_slug);
        return 'repos/' . $owner . '/' . $repo . '/generate';
    }
}

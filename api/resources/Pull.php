<?php
require_once VOCERO_API_ROOT . 'resources/BaseResource.php';

class Branch extends BaseResource
{
    protected bool $cached = false;
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO/pulls';

    private ?int $number = null;

    public function __construct(?int $number = null)
    {
        parent::__construct();
        $this->number = $number;
    }

    protected function get_endpoint(string $method): string
    {
        switch ($method) {
            case 'GET':
                return $this->endpoint . '/' . $this->number;
            default:
                return $this->endpoint;
        }
    }

    protected function get_payload(string $method, ?array $data = null): ?array
    {
        $data = parent::get_payload($method, $data);
        if (!$data || $method !== 'POST') return null;

        return [
            'title' => 'Pull from Vocero',
            'body' => 'Publish changes with Vocero',
            'head' => $this->env['GH_BRANCH'],
            'base' => $data['base']
        ];
    }
}

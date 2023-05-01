<?php
require_once VOCERO_API_ROOT . 'resources/BaseResource.php';

class Pull extends BaseResource
{
    protected $cached = false;
    protected $endpoint = '/repos/$GH_USER/$GH_REPO/pulls';

    private $number = null;

    public function __construct($number = null)
    {
        parent::__construct();
        $this->number = $number;
    }

    protected function get_endpoint($method)
    {
        switch ($method) {
            case 'GET':
                return $this->endpoint . '/' . $this->number;
            default:
                return $this->endpoint;
        }
    }

    protected function get_payload($method, $data = null)
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

<?php

require_once VOCERO_API_ROOT . 'resources/BaseResource.php';

class Page extends BaseResource
{
    public static array $methods = ['GET', 'POST', 'PUT'];

    protected bool $cached = false;
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO/pages';

    public function get_payload(string $method, ?array $data = null): ?array
    {
        $data = parent::get_payload($method, $data);
        if (!$data) return null;

        switch ($method) {
            case 'POST':
                return [
                    'source' => [
                        'branch' => $data['branch'],
                        'path' => $data['path']
                    ]
                ];
            case 'PUT':
                $output = [
                    'source' => [
                        'branch' => isset($data['branch']) ? $data['branch'] : $this->env['GH_BRANCH'],
                        'path' => isset($data['path']) ? $data['path'] : '/'
                    ]
                ];

                if (isset($data['https_enforced']) && $data['https_enforced']) {
                    $output['https_enforced'] = true;
                }

                if (isset($data['cname']) && !preg_match('/\.github\.io$/', $data['cname'])) {
                    $output['cname'] = $data['cname'];
                }

                return $output;
        }
    }
}

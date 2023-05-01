<?php
require_once VOCERO_API_ROOT . 'resources/BaseResource.php';
require_once VOCERO_API_ROOT . 'resources/BranchCompare.php';

class Ref extends BaseResource
{
    protected $cached = false;
    protected $endpoint = '/repos/$GH_USER/$GH_REPO/git/refs';

    private $name;
    private $update = false;

    public function __construct($branch_name = null)
    {
        parent::__construct();

        if ($branch_name) {
            $this->name = 'heads/' . $branch_name;
        } else {
            $this->name = 'heads/' . $this->env['GH_BRANCH'];
        }
    }

    protected function get_payload($method, $data = null)
    {
        $data = parent::get_payload($method, $data);
        if (!$data || $method !== 'POST') return null;

        if (isset($data['update']) && $data['update']) {
            $this->update = true;
        }

        return [
            'ref' => 'refs/' . $this->name,
            'sha' => $data['commit_sha'],
        ];
    }

    protected function get_endpoint($method)
    {
        switch ($method) {
            case 'GET':
                return $this->endpoint . '/' . $this->name;
            case 'POST':
                $endpoint = $this->endpoint;
                if ($this->update) $endpoint .= '/' . $this->name;
                return $endpoint;
        }
    }
}

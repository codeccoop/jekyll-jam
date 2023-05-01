<?php
require_once VOCERO_API_ROOT . 'resources/BaseResource.php';
require_once VOCERO_API_ROOT . 'resources/BranchCompare.php';

class Branch extends BaseResource
{
    protected bool $cached = false;
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO/branches';

    private string $branch_name;

    public function __construct(string $branch_name = null)
    {
        parent::__construct();

        $this->cache = new Cache('branch');

        if ($branch_name) {
            $this->branch_name = $branch_name;
        } else {
            $this->branch_name = $this->env['GH_BRANCH'];
        }
    }

    public function get(): array
    {
        $data = parent::get();

        $compare = (new BranchCompare($this->branch_name))->get();
        $data['ahead_by'] = $compare['ahead_by'];
        $data['behind_by'] = $compare['behind_by'];

        return $this->cache->post($data);
    }

    protected function decorate(): array
    {
        $data = $this->get();

        return [
            'sha' => $data['commit']['sha'],
            'name' => $data['name'],
            'protected' => $data['protected'],
            'repo' => $this->env['GH_REPO'],
            'ahead_by' => $data['ahead_by'],
            'behind_by' => $data['behind_by']
        ];
    }

    protected function get_endpoint($method): string
    {
        switch ($method) {
            case 'GET':
                return $this->endpoint . '/' . $this->branch_name;
        }
    }
}

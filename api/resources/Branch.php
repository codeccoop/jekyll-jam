<?php
require_once VOCERO_API_ROOT . 'resources/BaseResource.php';
require_once VOCERO_API_ROOT . 'resources/BranchCompare.php';

class Branch extends BaseResource
{
    protected string $cache_key = 'branch';
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO/branches';

    private string $branch_name;

    public function __construct(string $branch_name = null)
    {
        parent::__construct();

        if ($branch_name) {
            $this->branch_name = $branch_name;
        } else {
            $this->branch_name = $this->env['GH_BRANCH'];
        }
    }

    public function get(): array
    {
        $this->data = parent::get();

        $compare = (new BranchCompare($this->branch_name))->get();
        $this->data['ahead_by'] = $compare['ahead_by'];
        $this->data['behind_by'] = $compare['behind_by'];

        // $this->cache->sha = $this->data['sha'];
        /* if (!$this->cache->is_cached()) { */
        /*     $this->cache->reset(); */
        /* } */

        return $this->cache->post($this->data);
    }

    protected function decorate(?array $data = null): array
    {
        if (!$data) {
            $data = $this->get();
        }

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

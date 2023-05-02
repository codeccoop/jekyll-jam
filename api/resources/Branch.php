<?php
require_once VOCERO_API_ROOT . 'resources/BaseResource.php';
require_once VOCERO_API_ROOT . 'resources/BranchCompare.php';
require_once VOCERO_API_ROOT . 'resources/Commit.php';

class Branch extends BaseResource
{
    protected $cached = false;
    protected $endpoint = '/repos/$GH_USER/$GH_REPO/branches';

    private $branch_name;

    public function __construct($branch_name = null)
    {
        parent::__construct();

        $this->cache = new Cache('branch');

        if ($branch_name) {
            $this->branch_name = $branch_name;
        } else {
            $this->branch_name = $this->env['GH_BRANCH'];
        }
    }

    public function get()
    {
        $data = parent::get();

        $compare = (new BranchCompare($this->branch_name))->get();
        $data['ahead_by'] = $compare['ahead_by'];
        $data['behind_by'] = $compare['behind_by'];

        (new Commit($data['commit']['sha']))->get();

        return $this->cache->post($data);
    }

    protected function decorate()
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

    protected function get_endpoint($method)
    {
        switch ($method) {
            case 'GET':
                return $this->endpoint . '/' . $this->branch_name;
        }
    }
}

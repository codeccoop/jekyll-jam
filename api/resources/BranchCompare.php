<?php
require_once VOCERO_API_ROOT . 'resources/BaseResource.php';
require_once VOCERO_API_ROOT . 'resources/Repo.php';

class BranchCompare extends BaseResource
{
    // protected string $cache_key = 'branch_compare';
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO/compare';
    protected bool $cached = false;

    private string $branch_name;
    private string $default_branch;

    public function __construct(string $branch_name)
    {
        parent::__construct();
        $this->branch_name = $branch_name;
        $this->default_branch = (new Repo())->default_branch();
    }

    public function get_endpoint(string $method): string
    {
        return $this->endpoint . '/' . $this->default_branch . '...' . $this->branch_name;
    }
}

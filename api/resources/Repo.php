<?php
require_once VOCERO_API_ROOT . 'resources/BaseResource.php';

class Repo extends BaseResource
{
    public static array $methods = ['GET', 'POST'];

    protected string $cache_key = 'repo';
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO';

    public function default_branch(): string
    {
        $data = $this->get();
        return $data['default_branch'];
    }
}

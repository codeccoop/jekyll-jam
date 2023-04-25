<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Pull.php';
require_once VOCERO_API_ROOT . 'resources/Repo.php';

class PullRoute extends BaseRoute
{
    public array $methods = ['POST'];

    public function post(): void
    {
        $branch = (new Repo())->default_branch();
        $pull = (new Pull())->post($branch);
        $merge = (new Pull($pull['number']))->put();
        $this->send_output($merge);
    }
}

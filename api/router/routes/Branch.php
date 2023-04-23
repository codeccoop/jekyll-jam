<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Branch.php';

class BranchRoute extends BaseRoute
{
    public array $methods = ['GET'];

    public function get(): void
    {
        $branch = new Branch();
        $response = $branch->json();
        $this->send_output($response);
    }
}

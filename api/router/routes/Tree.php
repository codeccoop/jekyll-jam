<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Tree.php';

class TreeRoute extends BaseRoute
{
    public array $methods = ['GET'];

    public function get(): void
    {
        $tree = new Tree($this->req['query']['sha']);
        $response = $tree->json();
        $this->send_output($response);
    }
}

<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Tree.php';

class TreeRoute extends BaseRoute
{
    public $methods = ['GET'];

    public function get()
    {
        $tree = new Tree($this->req['query']['sha']);
        $response = $tree->json();
        $this->send_output($response);
    }
}

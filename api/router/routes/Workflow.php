<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Workflow.php';

class WorkflowRoute extends BaseRoute
{
    public $methods = ['OPTIONS', 'GET', 'PUT'];

    public function get($name = null)
    {
        $this->send_output((new Workflow($name))->json());
    }

    public function put()
    {
        $this->send_output((new Workflow())->put($this->req['payload']));
    }
}

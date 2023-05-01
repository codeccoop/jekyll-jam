<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'lib/Project.php';

class ProjectRoute extends BaseRoute
{
    public $methods = ['OPTIONS', 'GET', 'POST'];

    public function get()
    {
        $project = new Project();
        $response = $project->json();
        $this->send_output($response);
    }

    public function post()
    {
        $project = new Project();
        $project->post($this->req['payload']);
        $response = $project->json();
        $this->send_output($response);
    }
}

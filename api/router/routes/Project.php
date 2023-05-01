<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'lib/Project.php';

class ProjectRoute extends BaseRoute
{
    public array $methods = ['GET', 'POST'];

    public function get(): void
    {
        $project = new Project();
        $response = $project->json();
        $this->send_output($response);
    }

    public function post(): void
    {
        $project = new Dotfile();
        $project->post($this->req['payload']);
        $response = $project->json();
        $this->send_output($response);
    }
}

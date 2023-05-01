<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/WorkflowRun.php';

class WorkflowRunRoute extends BaseRoute
{
    public $methods = ['GET'];

    public function get()
    {
        $response = $this->fetch();
        $this->send_output($response);
    }

    private function fetch($try = 0)
    {
        try {
            return (new WorkflowRun())->json();
        } catch (Exception $e) {
            if ($e->getCode() === 404 && $try < 10) {
                sleep(1);
                return $this->fetch($try + 1);
            } else {
                $this->handle_http_exception($e);
            }
        }
    }
}

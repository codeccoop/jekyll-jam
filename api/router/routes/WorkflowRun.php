<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/WorkflowRun.php';

class WorkflowRunRoute extends BaseRoute
{
    public array $methods = ['GET'];

    public function get(): void
    {
        $response = $this->fetch();
        $this->send_output($response);
    }

    private function fetch(int $try = 0): string
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

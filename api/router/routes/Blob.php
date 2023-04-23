<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Blob.php';

class BlobRoute extends BaseRoute
{
    public array $methods = ['GET'];

    public function get(): void
    {
        if (!(isset($this->req['query']['sha']) && isset($this->req['query']['path']))) {
            throw new Exception("Invalid query arguments", 400);
        }

        $blob = new Blob($this->req['query']['sha'], $this->req['query']['path']);
        $response = $blob->json();
        $this->send_output($response);
    }
}

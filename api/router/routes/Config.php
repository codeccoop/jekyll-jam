<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Config.php';
require_once VOCERO_API_ROOT . 'resources/Tree.php';

class ConfigRoute extends BaseRoute
{
    public array $methods = ['GET'];

    public function get(): void
    {
        $tree = (new Tree($this->req['query']['sha']))->get();
        $sha = array_values(array_filter($tree['tree'], function ($node) {
            return $node['path'] == '_config.yml';
        }))[0]['sha'];
        $config = new Config($sha);
        $response = $config->json();
        $this->send_output($response);
    }
}

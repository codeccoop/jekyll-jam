<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Config.php';
require_once VOCERO_API_ROOT . 'resources/Tree.php';

class ConfigRoute extends BaseRoute
{
    public array $methods = ['GET'];

    public function get(): void
    {
        $tree = (new Tree($this->req['query']['tree_sha']))->get();

        $node = Config::get_tree_node($tree);
        if (!$node) {
            $this->handle_http_exception(new Exception("Config file not found", 404));
        }

        $sha = $node['sha'];
        $config = new Config($sha);
        $response = $config->json();
        $this->send_output($response);
    }
}

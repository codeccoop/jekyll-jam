<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Style.php';

class StyleRoute extends BaseRoute
{
    public $methods = ['GET'];

    public function get()
    {
        $tree = (new Tree($this->req['query']['tree_sha']))->get();

        $node = Style::get_tree_node($tree);
        if (!$node) {
            $this->handle_http_exception(new Exception("Style not found", 404));
        }

        $sha = $node['sha'];
        $style = new Style($sha);
        $response = $style->json();
        $this->send_output($response);
    }
}

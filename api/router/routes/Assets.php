<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'lib/Project.php';
require_once VOCERO_API_ROOT . 'lib/helpers.php';

class AssetsRoute extends BaseRoute
{
    public $methods = ['GET'];

    public function get()
    {
        $path = implode('/', array_slice($this->req['uri'], 2));
        $env = (new Project())->get();
        $url = get_base_url($env) . $path;
        $content = file_get_contents($url);

        if ($content) {
            $this->send_output($content, [
                'Content-Type' => get_filename_mimetype(basename($path)),
            ]);
        } else {
            $this->send_output('', null, 404);
        }
    }
}

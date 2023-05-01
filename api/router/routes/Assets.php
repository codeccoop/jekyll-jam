<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'lib/Project.php';
require_once VOCERO_API_ROOT . 'lib/helpers.php';

class AssetsRoute extends BaseRoute
{
    public array $methods = ['GET'];

    public function get(): void
    {
        $path = implode('/', array_slice($this->req['uri'], 3));
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

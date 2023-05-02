<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'lib/deployment.php';

class DeploymentRoute extends BaseRoute
{
    public $methods = ['GET'];

    public function get($name = null)
    {
        if (!(isset($this->req['query']['mode']) && in_array($this->req['query']['mode'], ['zip', 'ftp']))) {
            throw new Exception("Bad deployment mode", 400);
        }

        switch ($this->req['query']['mode']) {
            case 'ftp':
                vocero_ftp_deployment();
                $this->send_output('{"success": true}');
                break;
            case 'zip':
                $filepath = vocero_zip_deployment();
                $this->send_file($filepath, [
                    'Content-Type' => 'application/zip'
                ]);
                break;
        }
    }
}

<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Artifact.php';

class ArtifactRoute extends BaseRoute
{
    public array $methods = ['GET'];

    public function get(): void
    {
        $artifact = new Artifact();
        $filepath = $artifact->zip();
        $this->send_file($filepath, [
            'Content-Type' => 'application/zip',
        ]);
    }
}

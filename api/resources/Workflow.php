<?php

require_once VOCERO_API_ROOT . 'resources/BaseResource.php';

class Workflow extends BaseResource
{
    protected $cache_key = 'workflow';
    protected $endpoint = '/repos/$GH_USER/$GH_REPO/actions/workflows';

    private string $path = '.github/workflows/vocero.yml';

    public function get(): array
    {
        $data = parent::get();

        $workflow = null;
        if ($data['total_count'] > 0) {
            foreach ($data['workflows'] as $wf) {
                if ($wf['name'] === 'Vocero site CI') {
                    $workflow = $wf;
                    break;
                }
            }
        }

        if ($workflow === null) {
            throw new Exception("Workflow not found", 404);
        }

        return $this->cache->post($workflow);
    }

    public function put(?array $payload = null): array
    {
        if (isset($payload['branches'])) {
            $branches = $payload['branches'];
        } else {
            $branches = [$this->env['GH_BRANCH']];
        }

        (new Content($this->path))->put($this->config_template($branches));
        return $this->get();
    }

    private function config_template(array $branches = ['main'])
    {
        return [
            'name' => 'Vocero site CI',
            'on' => [
                'push' => [
                    'branches' => $branches
                ],
                'pull_request' => [
                    'branches' => $branches
                ]
            ],
            'jobs' => [
                'build' => [
                    'runs-on' => 'ubuntu-latest',
                    'steps' => [
                        ['uses' => 'actions/checkout@v3'],
                        [
                            'name' => 'Build the site in the jekyll/builder container',
                            'run' => 'docker run \
    -v ${{ github.workspace }}:/srv/jekyll -v ${{ github.workspace }}/_site:/srv/jekyll/_site \
    jekyll/builder:latest /bin/bash -c "cmod -R 777 /srv/jekyll && jekyll build --future"'
                        ]
                    ]
                ]
            ]
        ];
    }
}

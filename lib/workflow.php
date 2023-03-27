<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'workflow.php');
require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Client;

class Workflow
{

    private $env;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/actions/workflows';

    function __construct()
    {
        $this->env = (new Dotfile())->get();
        $this->cache = new Cache('workflow');

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
        if ($this->data) return $this->data;
        if ($this->cache->is_cached()) return $this->cache->get();

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $data = json_decode($response->getBody()->getContents(), true);

        $workflow = null;
        if ($data['total_count'] > 0) {
            foreach ($data['workflows'] as $wf) {
                if ($workflow['name'] === 'Jekyll site CI') {
                    $workflow = $wf;
                    break;
                }
            }
        }

        if ($workflow === null) {
            throw new Exception("404 Not Found", 404);
        }

        $this->data = $workflow;
        return $this->cache->post($workflow);
    }

    public function put($branches = null)
    {
        if ($this->content) {
            return $this->content->get();
        }

        if ($branches == null) {
            $branches = array($this->env['GH_BRANCH']);
        }

        $this->content = new Content($this->config_path);
        return $this->content->put($this->config_template($branches));
    }

    public function json()
    {
        $data = $this->get();
        return json_encode($data);
    }

    private function config_template($branches = array('main'))
    {

        return array(
            'name' => 'Jekyll site CI',
            'on' => array(
                'push' => array(
                    'branches' => $branches
                ),
                'pull_request' => array(
                    'branches' => $branches
                )
            ),
            'jobs' => array(
                'build' => array(
                    'runs-on' => 'ubuntu-latest',
                    'steps' => array(
                        array('uses' => 'actions/checkout@v3'),
                        array(
                            'name' => 'Build the site in the jekyll/builder container',
                            'run' => 'docker run \
    -v ${{ github.workspace }}:/srv/jekyll -v ${{ github.workspace }}/_site:/srv/jekyll/_site \
    jekyll/builder:latest /bin/bash -c "cmod -R 777 /srv/jekyll && jekyll build --future"'
                        )
                    )
                )
            )
        );
    }
}

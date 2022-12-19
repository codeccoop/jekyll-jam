<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'content.php');
require_once realpath(__DIR__ . DS . 'commit.php');
require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Client;

class Workflow
{

    private $env;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/actions/runs';
    private $data;

    function __construct()
    {
        $this->env = (new Dotfile())->get();
        $this->cache = new Cache('worflow');

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
        if ($this->data) return $this->data;

        $commit = (new Commit())->get();
        $commit_date = strtotime($commit['committer']['date']);

        if ($this->cache->is_cached()) {
            $this->data = $this->cache->get();
            $cache_date = strtotime($this->data['created_at']);
            if ($commit_date < $cache_date) {
                return $this->data;
            }
            $this->data = null;
        }

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint, array(
            'query' => array(
                'created' => '>=' . preg_replace("/\+.*$/", "", date('c', $commit_date))
            ),
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $data = json_decode($response->getBody()->getContents(), true);
        if ($data['total_count'] > 0) {
            $workflow = null;
            foreach ($data['workflow_runs'] as $run) {
                if ($workflow == null) $workflow = $run;
                else if (strtotime($workflow['created_at']) < strtotime($run['created_at'])) $workflow = $run;
            }
        } else {
            header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
            header('Content-Type: application/json');
            echo '{"status": "error", "message": "404 Not Found"}';
            exit;
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

<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'workflow.php');
require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Client;

class Artifact
{

    private $env;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/actions/runs/$RUN_ID';

    function __construct()
    {
        $this->env = (new Dotfile())->get();
        $this->cache = new Cache('artifact');

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
        if ($this->data) return $this->data;
        if ($this->cache->is_cached()) $cached = $this->cache->get();
        else $cached = null;

        $workflow = (new Workflow())->get();

        if ($cached && $cached['workflow_run']['id'] === $workflow['id']) {
            $cached['is_cached'] = true;
            return $cached;
        }

        $endpoint = str_replace('$WORKFLOW_ID', $workflow['id'], $this->endpoint);
        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $endpoint, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $data = json_decode($response->getBody()->getContents(), true);

        if ($data['total_count'] > 0) {
            $this->data = $data['artifacts'][0];
        } else {
            throw new Exception("404 Not Found", 404);
        }

        return $this->cache->post($this->data);
    }

    public function json()
    {
        $data = $this->get();
        return json_encode($data);
    }
}

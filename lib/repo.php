<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
// require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Client;

class Repo
{
    public $data;
    private $env;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO';

    function __construct()
    {
        $this->env = (new Dotfile())->get();

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
        if ($this->data) return $this->data;

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $this->data = json_decode($response->getBody()->getContents(), true);
        return $this->data;
    }

    public function post($name, $template_slug = false)
    {
        $payload = array(
            'name' => $name,
            'description' => 'This is a vocero site',
            'private' => false,
        );

        $endpoint = $this->endpoint;
        if ($template_slug) {
            $payload['owner'] = $this->env['GH_USER'];
            $payload['include_all_branches'] = false;
            $endpoint = $this->template_url($template_slug);
        }

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('POST', $endpoint, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'Bearer ' . $this->env['GH_ACCESS_TOKEN']
            ),
            'json' => $payload
        ));

        $this->data = json_decode($response->getBody()->getContents(), true);
        return $this->data;

        // return $this->cache->post($data);
    }

    public function defaultBranch()
    {
        $data = $this->get();
        return $data['default_branch'];
    }

    private function template_url($template_slug)
    {
        list($owner, $repo) = explode('/', $template_slug);
        return 'repos/' . $owner . '/' . $repo . '/generate';
    }
}

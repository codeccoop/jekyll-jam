<?php
require_once realpath(__DIR__ . '/dotfile.php');
require_once realpath(__DIR__ . '/../vendor/autoload.php');

use GuzzleHttp\Client;

class Repo
{
    public $data = null;
    private $env = null;
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
        if ($this->data) {
            return $this->data;
        }

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

    public function defaultBranch()
    {
        $data = $this->get();
        return $data['default_branch'];
    }
}

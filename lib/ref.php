<?php

require_once 'lib/dotfile.php';
require_once 'vendor/autoload.php';

use GuzzleHttp\Client;

class Ref
{
    public $name = null;
    private $env = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/git/refs';

    function __construct($name)
    {
        $this->name = $name;
        $this->env = (new Dotenv())->get();
        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint . '/' . $this->name, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));
        $json = json_decode($response->getBody()->getContents());
        return $json;
    }

    public function post($commit)
    {
        $payload = array(
            'ref' => 'refs/' . $this->name,
            'sha' => $commit
        );

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('POST', $this->endpoint, array(
            'json' => $payload,
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        return json_decode($response->getBody()->getContents());
    }
}

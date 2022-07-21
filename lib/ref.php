<?php

require_once realpath(__DIR__ . '/dotfile.php');
require_once realpath(__DIR__ . '/../vendor/autoload.php');

use GuzzleHttp\Client;

class Ref
{
    public $name = null;
    private $env = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/git/refs';

    function __construct($name = null)
    {
        $this->env = (new Dotfile())->get();
        if ($name) {
            $this->name = $name;
        } else {
            $this->name = 'heads/' . $this->env['GH_BRANCH'];
        }
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

        return json_decode($response->getBody()->getContents(), true);
    }

    public function post($commit, $update = false)
    {
        $payload = array(
            'ref' => 'refs/' . $this->name,
            'sha' => $commit
        );

        $client = new Client(array('base_uri' => $this->base_url));

        $endpoint = $this->endpoint;
        if ($update) {
            $endpoint .= '/' . $this->name;
        }

        $response = $client->request('POST', $endpoint, array(
            'json' => $payload,
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        return json_decode($response->getBody()->getContents(), true);
    }
}

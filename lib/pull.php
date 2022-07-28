<?php

require_once realpath(__DIR__ . '/dotfile.php');
require_once realpath(__DIR__ . '/../vendor/autoload.php');

use GuzzleHttp\Client;

class Pull
{
    private $env = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/pulls';
    private $number = null;

    function __construct($number = null)
    {
        $this->env = (new Dotfile())->get();
        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
        $this->number = $number;
    }

    public function get()
    {
        if ($this->data) {
            return $this->data;
        }

        $client = new Client(array('base_uri' => $this->base_url));

        $endpoint = $this->endpoint;
        if ($this->number) {
            $endpoint .= '/' . $this->number;
        }
        $response = $client->request('GET', $endpoint, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $this->data = json_decode($response->getBody()->getContents(), true);
        return $this->data;
    }

    public function post($base)
    {
        $payload = array(
            'title' => 'Pull from Jekyll JAM',
            'body' => 'Publish changes with Jekyll JAM',
            'head' => $this->env['GH_BRANCH'],
            'base' => $base
        );

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('POST', $this->endpoint, array(
            'json' => $payload,
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        return json_decode($response->getBody()->getContents(), true);
    }

    public function put()
    {
        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('PUT', $this->endpoint . '/' . $this->number . '/merge', array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        return json_decode($response->getBody()->getContents(), true);
    }

    public function json()
    {
        $data = $this->get();
        return json_encode($data);
    }
}

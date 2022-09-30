<?php

require_once realpath(__DIR__ . '/dotfile.php');
require_once realpath(__DIR__ . '/../vendor/autoload.php');

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;

class Content
{
    public $path = null;
    private $env = null;
    private $data = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/contents';

    function __construct($path)
    {
        $this->env = (new Dotfile())->get();
        $this->path = $path;
        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
        if ($this->data) {
            return $this->data;
        }

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint . '/' . $this->path, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $this->data = json_decode($response->getBody()->getContents(), true);
        return $this->data;
    }

    public function put($content, $message = null)
    {
        try {
            $this->data = $this->get();
        } catch (ClientException $e) {
            // pass
        }

        if ($message == null) {
            $message = 'Create file ' . $this->path;
        }

        $payload = array(
            'message' => $message,
            'committer' => array(
                'name' => $this->env['GH_USER'],
                'email' => $this->env['GH_EMAIL']
            ),
            'content' => base64_encode($content)
        );

        if ($this->data) {
            $payload['sha'] = $this->data['sha'];
        }

        $client = new Client(array('base_uri' => $this->base_url));

        $response = $client->request('PUT', $this->endpoint . '/' . $this->path, array(
            'json' => $payload,
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $response = json_decode($response->getBody()->getContents(), true);
        $this->data = $response['content'];

        return $this->data;
    }
}

<?php

require_once 'lib/dotfile.php';
require_once 'vendor/autoload.php';

use GuzzleHttp\Client;

class Commit
{
    public $sha = null;
    private $env = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/git/commits';

    function __construct($sha = null)
    {
        $this->sha = $sha;
        $this->env = (new Dotenv())->get();
        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get($sha = null)
    {
        $_sha = $sha == null ? $this->sha : $sha;
        if (!$_sha) {
            throw new TypeError('Invalid commit sha');
        }

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint . '/' . $_sha);
        $json = json_decode($response->getBody()->getContents());
        return $json;
    }

    public function post($message, $parent_sha, $tree_sha)
    {
        $payload = array(
            'message' => $message,
            'author' => array(
                'name' => $this->env['GH_USER'],
                'email' => $this->env['GH_EMAIL'],
                'date' => (new DateTime('now'))->format('Y-m-dTH:i:s+12:00')
            ),
            'parents' => array($parent_sha),
            'tree' => $tree_sha
        );

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('POST', $this->endpoint, array(
            'body' => $payload,
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        return json_decode($response->getBody()->getContents());
    }
}

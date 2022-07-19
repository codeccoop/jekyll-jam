<?php

require_once 'lib/dotfile.php';
require_once 'vendor/autoload.php';

use GuzzleHttp\Client;

class Blob
{
    public $sha = null;
    private $env = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/git/blobs';

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
        $response = $client->request('GET', $this->endpoint . '/' . $_sha . '?recursive=1');
        return json_decode($response->getBody()->getContents(), true);
    }

    public function post($content)
    {
        $payload = array(
            'content' => str_replace(PHP_EOL, '\n', $content),
            'encoding' => 'base64'
        );

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('POST', $this->endpoint, array(
            'body' => $payload,
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        return json_decode($response->getBody()->getContents(), true);
    }

    public function content()
    {
        $blob = $this->get();
        $decoded = base64_decode($blob['content']);
        return preg_replace('/---(\n|.)*---/m', '', $decoded);
    }

    public function frontmatter()
    {
        $blob = $this->get();
        $decoded = base64_decode($blob['content']);
        return preg_replace('/---(\n|.)*---/m', '', $decoded);
    }
}

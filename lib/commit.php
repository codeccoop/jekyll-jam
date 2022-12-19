<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Client;

class Commit
{
    public $sha = null;
    private $env = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/git/commits';
    private $data;

    function __construct($sha = null)
    {
        $this->sha = $sha;
        $this->env = (new Dotfile())->get();
        $this->cache = new Cache('commit', $sha);
        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get($sha = null)
    {
        if ($this->cache->is_cached()) return $this->cache->get();

        $_sha = $sha == null ? $this->sha : $sha;
        if (!$_sha) {
            throw new TypeError('Invalid commit sha');
        }

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint . '/' . $_sha, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $data = json_decode($response->getBody()->getContents(), true);
        return $this->cache->post($data);
    }

    public function post($message, $parent_sha, $tree_sha)
    {
        $payload = array(
            'message' => $message,
            'author' => array(
                'name' => $this->env['GH_USER'],
                'email' => $this->env['GH_EMAIL'],
                'date' => date('c')
            ),
            'parents' => array($parent_sha),
            'tree' => $tree_sha
        );

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('POST', $this->endpoint, array(
            'json' => $payload,
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $data = json_decode($response->getBody()->getContents(), true);
        return $this->cache->post($data);
    }
}

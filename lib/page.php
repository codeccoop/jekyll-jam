<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Client;

class Page
{
    private $data;
    private $env;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/pages';

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

    public function post($branch, $path = '/')
    {
        $payload = array(
            // 'build_type' => 'legacy',
            'source' => array(
                'branch' => $branch,
                'path' => $path
            )
        );

        $client = new Client(array('base_uri' => $this->base_url));

        $response = $client->request('POST', $this->endpoint, array(
            'json' => $payload,
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $this->data = json_decode($response->getBody()->getContents(), true);
        return $this->data;
    }

    public function put($changes)
    {
        $payload = array(
            'source' => array(
                'branch' => isset($changes['branch']) ? $changes['branch'] : $this->env['GH_BRANCH'],
                'path' => isset($changes['path']) ? $changes['path'] : '/'
            )
        );

        if ($changes['https_enforced']) {
            $payload['https_enforced'] = true;
        }

        if ($changes['cname'] && !preg_match('/\.github\.io$/', $changes['cname'])) {
            $payload['cname'] = $changes['cname'];
        }

        $client = new Client(array('base_uri' => $this->base_url));
        $client->request('PUT', $this->endpoint, array(
            'json' => $payload,
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));
    }
}

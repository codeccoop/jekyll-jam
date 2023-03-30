<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . 'ref.php');
require_once realpath(__DIR__ . DS . 'repo.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Client;

class Branch
{
    public $name;
    public $data;
    private $env;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/branches';

    function __construct($name = null)
    {
        $this->env = (new Dotfile())->get();
        $this->cache = new Cache('branch');

        if ($name) {
            $this->name = $name;
        } else {
            $this->name = $this->env['GH_BRANCH'];
        }

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
        if ($this->data) return $this->data;
        // if ($this->cache->is_cached()) return $this->cache->get();

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint . '/' . $this->name, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $this->data = json_decode($response->getBody()->getContents(), true);

        $compare = $this->compare();
        $this->data['ahead_by'] = $compare['ahead_by'];
        $this->data['behind_by'] = $compare['behind_by'];

        $this->cache->sha = $this->data['sha'];
        if (!$this->cache->is_cached()) {
            $this->cache->reset();
        }

        return $this->cache->post($this->data);
    }

    public function compare()
    {
        $default = (new Repo())->defaultBranch();
        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request(
            'GET',
            str_replace('branches', 'compare', $this->endpoint) . '/' . $default . '...' . $this->name,
            array(
                'headers' => array(
                    'Accept' => 'application/vnd.github+json',
                    'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
                )
            )
        );

        return json_decode($response->getBody()->getContents(), true);
    }

    public function json()
    {
        $branch = $this->get();
        $data = array(
            'sha' => $branch['commit']['sha'],
            'name' => $branch['name'],
            'protected' => $branch['protected'],
            'repo' => $this->env['GH_REPO'],
            'ahead_by' => $branch['ahead_by'],
            'behind_by' => $branch['behind_by']
        );

        return json_encode($data);
    }

    public function post($commit)
    {
        (new Ref())->post($commit);
        return $this->get();
    }
}

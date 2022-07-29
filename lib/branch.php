<?php
require_once realpath(__DIR__ . '/dotfile.php');
require_once realpath(__DIR__ . '/ref.php');
require_once realpath(__DIR__ . '/repo.php');
require_once realpath(__DIR__ . '/../vendor/autoload.php');

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;

class Branch
{
    public $name = null;
    public $data = null;
    private $env = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/branches';
    private $repo = null;

    function __construct($name = null)
    {
        $this->env = (new Dotfile())->get();

        if ($name) {
            $this->name = $name;
        } else {
            $this->name = $this->env['GH_BRANCH'];
        }

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);

        $this->repo = new Repo();
    }

    public function get()
    {
        if ($this->data) {
            return $this->data;
        }

        $client = new Client(array('base_uri' => $this->base_url));
        try {
            $response = $client->request('GET', $this->endpoint . '/' . $this->name, array(
                'headers' => array(
                    'Accept' => 'application/vnd.github+json',
                    'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
                )
            ));
        } catch (ClientException $e) {
            // Create the deployment branch
            $default = $this->repo->defaultBranch();
            $this->data = $this->_post($default['commit']['sha']);

            // Config github page
            require_once realpath(__DIR__ . '/page.php');
            (new Page())->post($default);

            // Return the brand new branch
            return $this->data;
        }

        $this->data = json_decode($response->getBody()->getContents(), true);

        $compare = $this->compare();
        $this->data['ahead_by'] = $compare['ahead_by'];
        $this->data['behind_by'] = $compare['behind_by'];

        return $this->data;
    }

    public function compare()
    {
        $default = $this->repo->defaultBranch();
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

    private function _post($commit)
    {
        (new Ref())->post($commit);
        return $this->get();
    }
}

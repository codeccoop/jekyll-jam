<?php
require_once realpath(__DIR__ . '/dotfile.php');
require_once realpath(__DIR__ . '/ref.php');
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
            $default = (new Branch($this->_default()))->get();
            return $this->_post($default['commit']['sha']);
        }

        $json = json_decode($response->getBody()->getContents(), true);
        $this->data = $json;
        return $json;
    }

    public function json()
    {
        $branch = $this->get();
        $data = array(
            'sha' => $branch['commit']['sha'],
            'name' => $branch['name'],
            'protected' => $branch['protected'],
            'repository' => $this->env['GH_REPO']
        );

        return json_encode($data);
    }

    private function _default()
    {
        return 'main';
        # $client = new Client(array('base_uri' => 'https://github.com'));
        # $response = $client->request('GET', '/' . $this->env['GH_USER'] . '/' . $this->env['GH_REPO'] . '/branches');
        # $content = $response->getBody()->getContents();
        # preg_match_all('/class=".*branch-name.*>(.*)</', $content, $matches);
        # echo print_r($matches);
        # return $matches[1][0];
    }

    private function _post($commit)
    {
        (new Ref())->post($commit);
        return $this->get();
    }
}

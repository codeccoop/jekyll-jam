<?php

require_once 'lib/dotfile.php';
require_once 'lib/ref.php';
require_once 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;

class Branch
{
    public $name = null;
    private $env = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/branches';

    function __construct($name = 'jekyll-jam')
    {
        $this->name = $name;
        $this->env = (new Dotenv())->get();
        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
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

        return json_decode($response->getBody()->getContents(), true);
    }

    private function _default()
    {
        $client = new Client(array('base_uri' => 'https://github.com'));
        $response = $client->request('GET', '/' . $this->env['GH_USER'] . '/' . $this->env['GH_REPO'] . '/branches');
        $content = $response->getBody()->getContents();
        preg_match_all('/class=".*branch-name.*>(.*)</', $content, $matches);
        return $matches[1][0];
    }

    private function _post($commit)
    {
        (new Ref('heads/' . $this->name))->post($commit);
        return $this->get();
    }
}

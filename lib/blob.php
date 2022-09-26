<?php

require_once realpath(__DIR__ . '/dotfile.php');
require_once realpath(__DIR__ . '/../vendor/autoload.php');

use GuzzleHttp\Client;
use Symfony\Component\Yaml\Yaml;

class Blob
{
    public $sha = null;
    public $data = null;
    private $env = null;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/git/blobs';
    private $path = null;
    private $is_asset = false;
    private $is_markdown = false;

    function __construct($sha = null, $path = null)
    {
        $this->sha = $sha;
        $this->path = $path;
        $this->is_asset = preg_match('/^assets/', $path);
        $this->is_markdown = preg_match('/\.(markdown|mkdown|mkdn|mkd|md)$/', $path);
        $this->env = (new Dotfile())->get();
        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    private function relative_links($content)
    {
        return preg_replace('/{{ *site\.baseurl *}}/', '', $content);
    }

    private function absolute_links($content)
    {
        preg_match('/\[[^\]]+[^\)]+\)/', $content, $matches_md);
        foreach ($matches_md as $match) {
            preg_match('/\([^\)]+\)/', $match, $url);
            if (!preg_match('/^\( *(http|mailto)/', $url[0])) {
                $content = str_replace($url[0], '({{ site.baseurl }}/' . preg_replace('/^ *\//', '', substr($url[0], 1)), $content);
            }
        }

        preg_match('/(src|href|srcset)=(\"|\')[^\'|\"]+(\'|\")/', $content, $matches_html);
        $i = 0;
        foreach ($matches_html as $match) {
            $i++;
            if ($i - 1 % 4 != 0) continue;
            preg_match('/(?<=\'|\").+(?=\'|\")/', $match, $url);
            if (!preg_match('/^ *(http|mailto)/', $url[0])) {
                $content = str_replace($url[0], '{{ site.baseurl }}/' . preg_replace('/^ *\//', '', $url[0]), $content);
            }
        }
        return $content;
    }

    public function get()
    {
        if ($this->data) {
            return $this->data;
        }

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint . '/' . $this->sha, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $this->data = json_decode($response->getBody()->getContents(), true);
        return $this->data;
    }

    public function post($content, $encoding = 'base64')
    {
        if ($encoding == 'base64') {
            if ($this->is_markdown) {
                $content = $this->absolute_links($content);
            }
            $content = base64_encode($content);
        }

        $payload = array(
            'content' => str_replace(PHP_EOL, '\n', $content),
            'encoding' => $encoding
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

    public function json()
    {
        $data = $this->get();
        $response = array(
            'sha' => $data['sha'],
            'path' => $this->path,
            'frontmatter' => $this->frontmatter($data['encoding']),
            'content' => $this->content($data['encoding']),
        );

        if ($this->is_asset) {
            $response['encoding'] = $data['encoding'];
        }

        return json_encode($response);
    }

    private function content($encoding)
    {
        $blob = $this->get();

        if ($encoding == 'base64') {
            if ($this->is_asset) {
                return $blob['content'];
            }
            $decoded = base64_decode($blob['content']);
        } else {
            $decoded = 'Unkown encoding';
        }

        return $this->relative_links(preg_replace('/^\n*(---)(.*)(---)(\n|$)*/s', '', $decoded));
    }

    private function frontmatter($encoding)
    {
        $blob = $this->get();
        if ($encoding == 'base64') {
            if (!$this->is_markdown) {
                return;
            }
            $decoded = base64_decode($blob['content']);
        } else {
            return;
        }

        preg_match_all('/^\n*(---)(.*)(---)(\n|$)*/s', $decoded, $matches);
        return Yaml::parse(str_replace('---', '', $matches[0][0]));
    }
}

<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . 'link.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Client;
use Symfony\Component\Yaml\Yaml;

class Blob
{
    public $sha;
    private $env;
    private $cache;
    private $path;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/git/blobs';
    private $is_asset = false;
    private $is_markdown = false;
    private $is_yaml = false;

    function __construct($sha = null, $path = null)
    {
        $this->sha = $sha;
        $this->path = $path;
        $this->env = (new Dotfile())->get();
        $this->cache = new Cache('blobs' . DS . $path, $sha);

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);

        $this->is_asset = preg_match('/^assets/', $path);
        $this->is_markdown = preg_match('/\.(markdown|mkdown|mkdn|mkd|md)$/', $path);
        $this->is_yaml = preg_match('/\.(yml|yaml)$/', $path);
    }

    private function relative_links($content)
    {
        return preg_replace('/{{\s*site\.baseurl\s*}}/', '', $content);
    }

    private function absolute_links($content)
    {
        $replace = fn ($link) => str_replace($link->source, $link->as_absolute(), $content);

        foreach (Link::get_links($content) as $link) {
            foreach ($link->get_children() as $sublink) {
                $content = $replace($sublink);
            }

            $content = $replace($link);
        }

        foreach (HLink::get_hlinks($content) as $hlink) {
            $content = $replace($hlink);
        }

        return $content;
    }

    public function get()
    {
        if ($this->cache->is_cached()) return $this->cache->get();

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $this->endpoint . '/' . $this->sha, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $data = json_decode($response->getBody()->getContents(), true);
        return $this->cache->post($data);
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

        $data = json_decode($response->getBody()->getContents(), true);
        return $data;
    }

    public function json()
    {
        $data = $this->get();
        $response = array(
            'sha' => $data['sha'],
            'path' => $this->path,
            'frontmatter' => $this->frontmatter(),
            'content' => $this->content(),
        );

        if ($this->is_asset) {
            $response['encoding'] = $data['encoding'];
        } else {
            $response['encoding'] = 'base64';
        }

        return json_encode($response);
    }

    private function content()
    {
        $blob = $this->get();
        $encoding = $blob['encoding'];

        if ($encoding == 'base64') {
            if ($this->is_asset) {
                $content = $blob['content'];
            } else {
                $decoded = base64_decode($blob['content']);

                if ($this->is_yaml) {
                    $content = json_encode(Yaml::parse($decoded));
                } else {
                    // $content = $this->relative_links(preg_replace('/^\n*(---)((.|\n|\r)*)(---)(\n|$)*/s', '', $decoded));
                    $content = $this->relative_links(preg_replace('/^[\n\r]*---[.\r\n]*---(\n|$)*/s', '', $decoded));
                }

                $content = base64_encode($content);
            }
        } else {
            throw new Exception('Unkown encoding ' . $encoding, 500);
        }

        return $content;
    }

    private function frontmatter()
    {
        $blob = $this->get();
        $encoding = $blob['encoding'];

        if ($encoding == 'base64') {
            if (!$this->is_markdown) {
                return;
            }
            $decoded = base64_decode($blob['content']);
        } else {
            return;
        }

        // preg_match_all('/^\n*(---)(.*)(---)(\n|$)*/s', $decoded, $matches);
        preg_match('/^[\n\r]*(?:---)([.\n\r]*)(?:---)/', $decoded, $matches);
        return Yaml::parse(str_replace('---', '', $matches[0][0]));
    }
}

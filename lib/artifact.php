<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'workflow.php');
require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;

class Artifact
{

    private $env;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/actions/runs/$WORKFLOW_ID/artifacts';

    function __construct()
    {
        $this->env = (new Dotfile())->get();
        $this->cache = new Cache('artifact');

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
        if ($this->data) return $this->data;
        if ($this->cache->is_cached()) $cached = $this->cache->get();
        else $cached = null;

        $workflow = (new Workflow())->get();

        if ($cached && $cached['workflow_run']['id'] === $workflow['id']) {
            $cached['is_cached'] = true;
            return $cached;
        }

        $endpoint = preg_replace('/$WORKFLOW_ID/', $workflow['id'], $this->endpoint);
        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', $endpoint, array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $data = json_decode($response->getBody()->getContents(), true);

        if ($data['total_count'] > 0) {
            $this->data = $data['artifacts'][0];
        } else {
            header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
            header('Content-Type: application/json');
            echo '{"status": "error", "message": "404 Not Found"}';
            exit();
        }

        return $this->cache->post($this->data);
    }

    public function json()
    {
        $data = $this->get();
        return json_encode($data);
    }

    public function zip()
    {
        $data = $this->get();

        $dir = realpath(__DIR__ . DS . '..' . DS . '.artifacts');
        $latest = $dir . DS . 'latest.zip';
        $backup = $dir . DS . 'recovery.zip';

        if (file_exists($latest)) {
            $expired = time() > strtotime($data['expires_at']);
            $is_cached = $data['is_cached'];
            if ($expired || $is_cached) {
                header('Content-disposition: attachment;filename=latest.zip');
                header("Content-Length: " . filesize($latest));
                readfile($latest);
                exit();
            } else {
                rename($latest, $backup);
                $recovery = true;
            }
        } else {
            $recovery = false;
        }

        try {
            $stream = fopen($latest, 'w');
            $client = new Client(array('base_uri' => $this->base_url));
            $response = $client->request('GET', $this->endpoint . '/' . $data['id'] . '/zip', array(
                'sink' => $stream,
                'headers' => array(
                    'Accept' => 'application/vnd.github+json',
                    'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
                )
            ));
        } catch (ClientException $e) {
            if ($recovery) rename($backup, $latest);
            header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error');
            header('Content-Type: application/json');
            echo '{"status": "error", "message": "' . $e->getMessage() . '"}';
            exit();
        }

        if (file_exists($latest)) {
            header('Content-disposition: attachment;filename=latest.zip');
            header("Content-Length: " . filesize($latest));
            readfile($latest);
            exit();
        } else {
            header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
            header('Content-Type: application/json');
            echo '{"status": "error", "message": "File not found"}';
            exit();
        }
    }
}

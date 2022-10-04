<?php
define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . 'workflow.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;

class Artifact
{

    private $env;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/actions/runs/$ID/artifacts';
    private $workflow;

    public $id;

    function __construct()
    {
        $this->env = (new Dotfile())->get();
        $this->cache = new Cache('artifact');

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);

        $this->workflow = (new Workflow())->get();
        preg_match('/(?<=\/)[0-9]+(?=\/)/', $this->workflow['artifacts_url'], $mathes);
        $this->id = $mathes[0];
    }

    public function get()
    {
        if ($this->data) return $this->data;

        $client = new Client(array('base_uri' => $this->base_url));
        $response = $client->request('GET', str_replace('$ID', $this->id, $this->endpoint), array(
            'headers' => array(
                'Accept' => 'application/vnd.github+json',
                'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
            )
        ));

        $data = json_decode($response->getBody()->getContents(), true);

        if ($data['total_count'] > 0) {
            $artifact = null;
            foreach ($data['artifacts'] as $arti) {
                if ($artifact == null) $artifact = $arti;
                else if (strtotime($artifact['created_at']) < strtotime($arti['created_at'])) $artifact = $arti;
            }
        } else {
            return $this->cache->get();
        }

        $this->data = $artifact;
        return $this->cache->post($artifact);
    }

    public function json()
    {
        $data = $this->get();
        return json_encode($data);
    }

    public function zip()
    {
        $endpoint = str_replace('artifacts', 'zip', $this->endpoint);
        $endpoint = str_replace('runs', 'artifacts', $endpoint);
        $endpoint = str_replace('$ID', $this->id, $endpoint);
        $dir = realpath(__DIR__ . DS . '..' . DS . '.artifacts');
        $latest = $dir . DS . 'latest.zip';
        $backup = $dir . DS . 'recovery.zip';

        if (file_exists($latest)) {
            rename($latest, $backup);
            $recovery = true;
        } else {
            $recovery = false;
        }

        try {
            $stream = fopen($latest, 'w');
            $client = new Client(array('base_uri' => $this->base_url));
            $response = $client->request('GET', $endpoint, array(
                'sink' => $stream,
                'headers' => array(
                    'Accept' => 'application/zip',
                    'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
                )
            ));
            fclose($stream);
            $response->getBody();
        } catch (ClientException $e) {
            if ($recovery) {
                rename($backup, $latest);
            }
        }

        if (file_exists($latest)) {
            header('Content-disposition: attachment;filename=latest.zip');
            header('Content-Type: application/zip');
            header("Content-Length: " . filesize($latest));

            readfile($latest);
            exit;
        } else {
            http_response_code(404);
            exit;
        }
    }
}

<?php
require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'workflow_run.php');
require_once realpath(__DIR__ . DS . 'cache.php');
require_once realpath(__DIR__ . DS . '..' . DS . 'vendor' . DS . 'autoload.php');

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;

class Artifact
{

    private $env;
    private $base_url = 'https://api.github.com';
    private $endpoint = '/repos/$GH_USER/$GH_REPO/actions/artifacts/$ARTIFACT_ID/zip';

    function __construct()
    {
        $this->env = (new Dotfile())->get();
        $this->cache = new Cache('artifact');

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);
    }

    public function get()
    {
        // TODO: Move this to lib/run.php

        if ($this->data) return $this->data;
        if ($this->cache->is_cached()) $cached = $this->cache->get();
        else $cached = null;

        $workflow_run = new WorkflowRun();
        if ($cached && $cached['workflow_run']['id'] === $workflow_run->get()['id']) {
            $cached['is_cached'] = true;
            return $cached;
        }

        $artifact = $workflow_run->get_artifact();
        $artifact['is_cached'] = false;
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
        $data = $this->get();

        $dir = realpath(__DIR__ . DS . '..' . DS . '.artifacts');
        $latest = $dir . DS . 'latest.zip';
        $backup = $dir . DS . 'recovery.zip';

        if (file_exists($latest)) {
            $expired = time() > strtotime($data['expires_at']);
            $is_cached = $data['is_cached'];
            if ($expired || $is_cached) {
                return $latest;
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
            $client->request('GET', str_replace('$ARTIFACT_ID', $data['id'], $this->endpoint), array(
                'sink' => $stream,
                'headers' => array(
                    'Accept' => 'application/vnd.github+json',
                    'Authorization' => 'token ' . $this->env['GH_ACCESS_TOKEN']
                )
            ));
        } catch (ClientException $e) {
            if ($recovery) rename($backup, $latest);
            throw new Exception("500 Internal Server Error", 500);
        }

        if (file_exists($latest)) {
            return $latest;
        } else {
            throw new Exception('404 Not Found', 404);
        }
    }
}

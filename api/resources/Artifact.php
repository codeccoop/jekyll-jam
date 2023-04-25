<?php

require_once VOCERO_API_ROOT . 'resources/BaseResource.php';
require_once VOCERO_API_ROOT . 'resources/WorkflowArtifact.php';
require_once VOCERO_API_ROOT . 'resources/Commit.php';

class Artifact extends BaseResource
{
    protected bool $cached = false;
    protected string $cache_key = 'workflow_artifact';
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO/actions/artifacts/$ARTIFACT_ID/zip';

    private string $latest = VOCERO_API_ROOT . '../.artifacts/latest.zip';
    private string $backup = VOCERO_API_ROOT . '../.artifacts/backup.zip';

    public function __construct()
    {
        parent::__construct();
        $this->cache = new WorkflowArtifactCache($this->cache_key, (new Commit())->get());
    }

    public function get(): array
    {
        if ($this->cache->is_cached()) {
            return $this->cache->get();
        }

        $artifact = (new WorkflowArtifact())->get();
        return $this->cache->post($artifact);
    }

    protected function get_endpoint(string $method): string
    {
        $data = $this->get();
        return $data['archive_download_url'];
    }

    protected function get_sink(string $method): mixed
    {
        if (is_file($this->latest)) {
            unlink($this->latest);
        }

        return $this->latest;
    }

    public function zip()
    {
        $data = $this->get();

        $recovery = false;
        if (file_exists($this->latest)) {
            $expired = time() > strtotime($data['expires_at']);
            $cached = isset($data['is_cached']) ? $data['is_cached'] : false;
            if ($expired || $cached) {
                return $this->latest;
            } else {
                rename($this->latest, $this->backup);
                $recovery = true;
            }
        }

        try {
            parent::get();
        } catch (Exception $e) {
            throw $e;
        } finally {
            if ($recovery) rename($this->backup, $this->latest);
        }

        if (file_exists($this->latest)) {
            $data['is_cached'] = true;
            $this->cache->post($data);
            return $this->latest;
        } else {
            throw new Exception("File Not Found", 404);
        }
    }
}

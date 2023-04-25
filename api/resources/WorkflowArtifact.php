<?php

require_once VOCERO_API_ROOT . 'resources/BaseResource.php';
require_once VOCERO_API_ROOT . 'resources/Commit.php';

class WorkflowArtifactCache extends Cache
{
    private array $commit;

    public function __construct(string $file_path, array $commit)
    {
        parent::__construct($file_path);
        $this->commit = $commit;
    }

    public function is_cached(): bool
    {
        if (!parent::is_cached()) return false;

        $cached = parent::get();

        if ($cached['workflow_run']['head_sha'] !== $this->commit['sha']) return false;
        if ($cached['expired']) return false;
        if (strtotime($cached['expires_at']) <= time()) return false;

        return true;
    }
}

class WorkflowArtifact extends BaseResource
{
    protected string $endpoint = '/repos/$GH_USER/$GH_REPO/actions/artifacts';
    protected bool $cached = false;
    protected string $cache_key = 'workflow_artifact';

    private array $commit;

    public function __construct()
    {
        parent::__construct();
        $this->commit = (new Commit())->get();
        $this->cache = new WorkflowArtifactCache($this->cache_key, $this->commit);
    }

    public function get(): array
    {
        if ($this->cache->is_cached()) return $this->cache->get();

        $data = parent::get();

        $workflow_artifact = null;
        if ($data['total_count'] > 0) {
            foreach ($data['artifacts'] as $artifact) {
                if ($artifact['workflow_run']['head_sha'] === $this->commit['sha']) { // && !$artifact['expired']) {
                    $workflow_artifact = $artifact;
                    break;
                }
            }
        }

        if ($workflow_artifact === null) {
            throw new Exception('WorkflowArtifact not found', 404);
        }

        return $this->cache->post($workflow_artifact);
    }
}

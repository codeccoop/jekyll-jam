<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Blob.php';
require_once VOCERO_API_ROOT . 'resources/Branch.php';
require_once VOCERO_API_ROOT . 'resources/Tree.php';
require_once VOCERO_API_ROOT . 'resources/Ref.php';
require_once VOCERO_API_ROOT . 'resources/Commit.php';

class CommitRoute extends BaseRoute
{
    public array $methods = ['POST', 'DELETE'];

    public function post(): void
    {
        if (!isset($this->req['payload']) || !is_array($this->req['payload']) || count($this->req['payload']) === 0) {
            $this->handle_http_exception(new Exception("Invalid payload", 400));
        }

        $changes = [];
        foreach ($this->req['payload'] as $file) {
            $path = base64_decode($file['path']);
            $content = base64_decode($file['content']);
            $blob = (new Blob(null, $path))->post([
                'path' => $path,
                'encoding' => 'base64',
                'content' => $content,
                'frontmatter' => $file['frontmatter']
            ]);
            $changes[] = [
                'path' => $path,
                'type' => 'blob',
                'mode' => '100644',
                'sha' => $blob['sha']
            ];
        }

        $commit = (new Branch())->get()['commit'];
        $tree = (new Tree())->post([
            'base_sha' => $commit['sha'],
            'changes' => $changes
        ]);

        $commit = (new Commit())->post([
            'message' => "Edit by Vocero",
            'parent_sha' => $commit['sha'],
            'tree_sha' => $tree['sha']
        ]);

        $ref = (new Ref())->post(['commit_sha' => $commit['sha'], 'update' => true]);

        $response = [
            'changes' => $changes,
            'tree' => $tree,
            'commit' => $commit,
            'ref' => $ref
        ];

        $this->send_output(json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    public function delete(): void
    {
        if (!(isset($this->req['query']['sha']) && isset($this->req['query']['sha']))) {
            $this->handle_http_exception(new Exception("Invalid payload", 400));
        }

        $sha = $this->req['query']['sha'];
        $path = $this->req['query']['path'];

        $blob = (new Blob($sha, $path))->get();
        $tree = (new Tree())->delete_blob($sha);
        $parent_commit = (new Commit())->get();
        $tree = (new Tree())->post([
            'changes' => $tree['tree']
        ]);
        $commit = (new Commit())->post([
            'message' => "Drop $path by Vocero",
            'parent_sha' => $parent_commit['sha'],
            'tree_sha' => $tree['sha']
        ]);
        $ref = (new Ref())->post([
            'commit_sha' => $commit['sha'],
            'update' => true
        ]);

        $response = [
            'changes' => [$blob],
            'tree' => $tree,
            'commit' => $commit,
            'ref' => $ref
        ];

        $this->send_output(json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }
}

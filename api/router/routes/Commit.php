<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Blob.php';
require_once VOCERO_API_ROOT . 'resources/Branch.php';
require_once VOCERO_API_ROOT . 'resources/Tree.php';
require_once VOCERO_API_ROOT . 'resources/Ref.php';
require_once VOCERO_API_ROOT . 'resources/Commit.php';

class CommitRoute extends BaseRoute
{
    public $methods = ['OPTIONS', 'POST', 'DELETE'];

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
                'encoding' => $file["encoding"],
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
        $tree = new Tree();
        $tree_sha = $tree->post([
            'base_sha' => $commit['sha'],
            'changes' => $changes
        ])['sha'];

        $commit = (new Commit())->post([
            'message' => "Edit by Vocero",
            'parent_sha' => $commit['sha'],
            'tree_sha' => $tree_sha
        ]);

        $ref = (new Ref())->post(['commit_sha' => $commit['sha'], 'update' => true]);

        $response = [
            'changes' => $changes,
            'tree' => json_decode($tree->json(), true),
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
        $parent_commit = (new Commit())->get();
        $tree = new Tree();

        $leafs = array_map(function ($leaf) {
            if (!isset($leaf['pruned'])) return $leaf;
            $blob = json_decode((new Blob($leaf['sha'], $leaf['path']))->json(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $blob = (new Blob(null, $leaf['path']))->post([
                'encoding' => $blob['encoding'],
                'content' => base64_decode($blob['content']),
                'frontmatter' => $blob['frontmatter']
            ]);
            return [
                'sha' => $blob['sha'],
                'path' => $leaf['path'],
                'type' => $leaf['type'],
                'mode' => $leaf['mode']
            ];
        }, $tree->drop_leaf($sha, $path));
        $tree_sha = $tree->post(['changes' => $leafs])['sha'];
        $commit = (new Commit())->post([
            'message' => "Drop $path by Vocero",
            'parent_sha' => $parent_commit['sha'],
            'tree_sha' => $tree_sha
        ]);
        $ref = (new Ref())->post([
            'commit_sha' => $commit['sha'],
            'update' => true
        ]);

        $response = [
            'changes' => [$blob],
            'tree' => json_decode((new Tree($tree_sha))->json(), true),
            'commit' => $commit,
            'ref' => $ref
        ];

        $this->send_output(json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }
}

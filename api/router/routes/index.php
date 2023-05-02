<?php

$routes = [
    'artifact' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Artifact.php';
        return new ArtifactRoute();
    },
    'assets' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Assets.php';
        return new AssetsRoute();
    },
    'blob' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Blob.php';
        return new BlobRoute();
    },
    'blocks' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Blocks.php';
        return new BlocksRoute();
    },
    'branch' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Branch.php';
        return new BranchRoute();
    },
    'commit' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Commit.php';
        return new CommitRoute();
    },
    'config' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Config.php';
        return new ConfigRoute();
    },
    'init' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Init.php';
        return new InitRoute();
    },
    'project' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Project.php';
        return new ProjectRoute();
    },
    'pull' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Pull.php';
        return new PullRoute();
    },
    'style' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Style.php';
        return new StyleRoute();
    },
    'tree' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Tree.php';
        return new TreeRoute();
    },
    'workflow' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/Workflow.php';
        return new WorkflowRoute();
    },
    'workflow_run' => function () {
        require_once VOCERO_API_ROOT . 'router/routes/WorkflowRun.php';
        return new WorkflowRunRoute();
    }
];

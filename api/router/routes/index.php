<?php

require_once VOCERO_API_ROOT . 'router/routes/Project.php';
require_once VOCERO_API_ROOT . 'router/routes/Branch.php';
require_once VOCERO_API_ROOT . 'router/routes/Blob.php';
require_once VOCERO_API_ROOT . 'router/routes/Tree.php';
require_once VOCERO_API_ROOT . 'router/routes/Config.php';
require_once VOCERO_API_ROOT . 'router/routes/Blocks.php';

$routes = [
    'project' => fn () => new ProjectRoute(),
    'branch' => fn () => new BranchRoute(),
    'tree' => fn () => new TreeRoute(),
    'blob' => fn () => new BlobRoute(),
    'config' => fn () => new ConfigRoute(),
    'blocks' => fn () => new BlocksRoute(),
];

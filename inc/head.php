<?php
require_once realpath(__DIR__ . '/../lib/branch.php');
require_once realpath(__DIR__ . '/../lib/tree.php');
?>

<html lang="en">

<head>
    <title>Jekyll JAM</title>
    <meta charset="utf-8" />

    <link rel="stylesheet" href="static/css/index.css">
    <style>
        <?php
        switch ($_SERVER['SCRIPT_NAME']) {
            case '/editor.php':
                include_once realpath(__DIR__ . '/../static/bundle/editor.css');
                break;
            case '':
                include_once realpath(__DIR__ . '/../static/bundle/home.css');
                break;
            default:
                include_once realpath(__DIR__ . '/../static/bundle/home.css');
        }
        ?>
    </style>

    <script src="https://unpkg.com/htmx.org@1.8.0"></script>
</head>

<body>
    <div class="app">
        <header class="app__header">
            <div class="app__brand">
                <picture class="app__logo">
                    <source src="static/images/app-logo.webp">
                    <img src="static/images/app-logo.png">
                </picture>
                Jekyll JAM
            </div>
        </header>
        <nav class="app__sidebar">
            <?php
            $commit = (new Branch())->get()['commit']['sha'];
            (new Tree($commit))->render();
            ?>
        </nav>
        <main class="app__content">

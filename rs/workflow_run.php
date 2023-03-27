<?php
header('Allow: GET');
header('Content-Type: application/json');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 405 Method Not Allowed');
    header('Content-Type: application/json');
    echo '{"status": "error", "message": "Method not allowed"}';
    exit();
}

define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'workflow_run.php');

function fetch($try = 0)
{
    try {
        return (new WorkflowRun())->json();
    } catch (Exception $e) {
        if ($e->getCode() === 404 && $try < 10) {
            sleep(1);
            return fetch($try + 1);
        } else {
            header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
            header('Content-Type: application/json');
            echo '{"status": "error", "message": "404 Not Found"}';
            die();
        }
    }
}

$response = fetch();
echo $response;

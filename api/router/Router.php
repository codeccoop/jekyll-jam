<?php

require_once VOCERO_API_ROOT . 'router/routes/index.php';
require_once VOCERO_API_ROOT . 'router/RoutesMap.php';

$routes_map = new RoutesMap($routes);

class Router
{
    static function resolve(): void
    {
        $uri = Router::get_uri();
        $query = Router::get_query();
        $payload = Router::get_payload();

        global $routes_map;
        if (!(isset($uri[3]) && $routes_map[$uri[3]])) {
            header('HTTP/1.1 404 Not Found');
            exit;
        } else {
            $route = $routes_map[$uri[3]];
        }

        $method = $_SERVER['REQUEST_METHOD'];
        if (!in_array($method, $route->methods)) {
            header('HTTP/1.1 405 Method Not Allowed');
            exit;
        }

        $route->resolve([
            'method' => $method,
            'uri' => $uri,
            'query' => $query,
            'payload' => $payload,
        ]);
    }

    static function get_uri(): array
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        return explode('/', $uri);
    }

    static function get_query(): array
    {
        if (!isset($_SERVER['QUERY_STRING'])) return [];

        parse_str($_SERVER['QUERY_STRING'], $query);
        return $query;
    }

    static function get_payload(): ?array
    {
        if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
            return json_decode(file_get_contents('php://input'), true);
        }

        return null;
    }
}

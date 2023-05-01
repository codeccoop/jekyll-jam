<?php

require_once VOCERO_API_ROOT . 'router/routes/index.php';
require_once VOCERO_API_ROOT . 'router/RoutesMap.php';

$routes_map = new RoutesMap($routes);

class Router
{
    static function resolve()
    {
        $uri = Router::get_uri();
        $query = Router::get_query();
        $payload = Router::get_payload();

        global $routes_map;
        if (!(isset($uri[2]) && isset($routes_map[$uri[2]]))) {
            http_response_code(404);
            exit;
        } else {
            $route = $routes_map[$uri[2]];
        }

        $method = $_SERVER['REQUEST_METHOD'];
        if (!in_array($method, $route->methods)) {
            header('Allow: ' . implode(', ', $route->methods));
            http_response_code(405);
            exit;
        }

        $route->resolve([
            'method' => $method,
            'uri' => $uri,
            'query' => $query,
            'payload' => $payload,
        ]);
    }

    static function get_uri()
    {
        $base_url = isset($_ENV['VOCERO_BASE_URL']) ? $_ENV['VOCERO_BASE_URL'] : '';
        $base_url = parse_url($base_url, PHP_URL_PATH);
        $base_url = explode('/', $base_url);
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $uri = explode('/', $uri);

        return array_values(array_filter($uri, function ($chunk, $i) use ($base_url) {
            if (isset($base_url[$i]) && $base_url[$i] == $chunk) return false;
            return $chunk;
        }, ARRAY_FILTER_USE_BOTH));
    }

    static function get_query()
    {
        if (!isset($_SERVER['QUERY_STRING'])) return [];

        parse_str($_SERVER['QUERY_STRING'], $query);
        return $query;
    }

    static function get_payload()
    {
        if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
            return json_decode(file_get_contents('php://input'), true);
        }

        return null;
    }
}

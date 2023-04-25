<?php

class BaseRoute
{
    public array $methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    protected array $req;

    /**
     * Resolve server requests to route callbacks
     *
     * @param BaseRoute $Route
     * @param array $req
     */
    public function resolve($req): void
    {
        $this->req = $req;

        try {
            switch ($req['method']) {
                case 'GET':
                    $this->get();
                    break;
                case 'POST':
                    $this->post();
                    break;
                case 'PUT':
                    $this->put();
                    break;
                case 'PATCH':
                    $this->patch();
                    break;
                case 'DELETE':
                    $this->delete();
                    break;
            }
        } catch (Exception $e) {
            $this->handle_http_exception($e);
        }
    }

    /**
     * Route GET request callback
     */
    public function get(): void
    {
    }

    /**
     * Route POST request callback
     */
    public function post(): void
    {
    }

    /**
     * Route PUT request callback
     */
    public function put(): void
    {
    }

    /**
     * Route PATCH request callback
     */
    public function patch(): void
    {
    }

    /**
     * Route DELETE request callback
     */
    public function delete(): void
    {
    }

    /**
     * Send API output.
     *
     * @param string $data
     * @param ?array $headers
     * @param int $code
     */
    protected function send_output(string $data, ?array $headers = null, int $code = 200): void
    {
        if ($code >= 400) {
            http_response_code($code);
            echo $data;
            exit;
        }

        if (!$headers) {
            $headers = $this->get_headers($_SERVER['REQUEST_METHOD']);
        } else {
            $headers = array_reduce(array_keys($headers), function ($carry, $header) use ($headers) {
                if ($headers[$header]) $carry[$header] = $headers[$header];
                return $carry;
            }, $this->get_headers($_SERVER['REQUEST_METHOD']));
        }

        // header_remove('Set-Cookie');
        if (is_array($headers) && count($headers)) {
            foreach ($headers as $header => $value) {
                header("$header: $value");
            }
        }

        echo $data;
        exit;
    }

    /**
     * Send file
     *
     * @param string $filepath
     * @param array $headers
     * @param int $code
     */
    protected function send_file(string $filepath, array $headers, int $code = 200): void
    {
        if ($code >= 400) {
            http_response_code($code);
            echo '';
            exit;
        }

        if (!is_file($filepath)) {
            http_response_code(404);
            echo '';
            exit;
        }

        foreach ($headers as $header => $value) {
            header("$header: $value");
        }

        $filename = basename($filepath);
        header("Content-disposition: attachment; filename=$filename");
        $size = filesize($filepath);
        header("Content-Length: $size");
        readfile($filepath);
        exit;
    }

    /**
     * Get API response http headers
     *
     * @param string $method
     */
    protected function get_headers(string $method): array
    {
        return [
            'Content-Type' => 'application/json',
            'Allow' => 'OPTIONS, ' . implode(', ', $this->methods),
            'Access-Control-Allow-Origin' => '*',
        ];
    }

    protected function handle_http_exception(Exception $e): void
    {
        $code = $e->getCode();
        $output = VOCERO_DEBUG ? $e->getMessage() : '';
        $headers = $this->get_headers($_SERVER['REQUEST_METHOD']);
        switch ($code) {
            case 400:
                $this->send_output($output, $headers, 400);
                break;
            case 401:
                $this->send_output($output, $headers, 401);
                break;
            case 403:
                $this->send_output($output, $headers, 403);
                break;
            case 404:
                $this->send_output($output, $headers, 404);
                break;
            case 408:
                $this->send_output($output, $headers, 408);
                break;
            default:
                $this->send_output($output, null, 500);
                break;
        }
    }
}

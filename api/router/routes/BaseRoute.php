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
     * @param mixed $data
     * @param string $httpHeader
     */
    protected function send_output(string $data, ?array $httpHeaders = null): void
    {
        if (!$httpHeaders) {
            $httpHeaders = $this->get_headers($_SERVER['REQUEST_METHOD']);
        }

        // header_remove('Set-Cookie');
        if (is_array($httpHeaders) && count($httpHeaders)) {
            foreach ($httpHeaders as $httpHeader) {
                header($httpHeader);
            }
        }

        echo $data;
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
            'Content-Type: application/json',
            'Allow: OPTIONS, ' . implode(', ', $this->methods),
            'Access-Control-Allow-Origin: *',
        ];
    }

    protected function handle_http_exception(Exception $e): void
    {
        $code = $e->getCode();
        $output = VOCERO_DEBUG ? $e->getMessage() : '';
        switch ($code) {
            case 400:
                $this->send_output($output, ['HTTP/1.1 400 Bad Request']);
                break;
            case 401:
                $this->send_output($output, ['HTTP/1.1 401 Unauthorized']);
                break;
            case 403:
                $this->send_output($output, ['HTTP/1.1 403 Forbidden']);
                break;
            case 404:
                $this->send_output($output, ['HTTP/1.1 404 Not Found']);
                break;
            default:
                $this->send_output($output, ['HTTP/1.1 500 Internal Server Error']);
                break;
        }
    }
}

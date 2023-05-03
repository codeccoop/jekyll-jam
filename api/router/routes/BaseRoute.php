<?php

class BaseRoute
{
    public $methods = ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    protected $req;

    /**
     * Resolve server requests to route callbacks
     *
     * @param BaseRoute $Route
     * @param array $req
     */
    public function resolve($req)
    {
        $this->req = $req;

        try {
            switch ($req['method']) {
                case 'OPTIONS':
                    $this->options();
                    break;
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
     * Route OPTIONS request callback
     */
    public function options()
    {
        $this->send_output("");
    }

    /**
     * Route GET request callback
     */
    public function get()
    {
    }

    /**
     * Route POST request callback
     */
    public function post()
    {
    }

    /**
     * Route PUT request callback
     */
    public function put()
    {
    }

    /**
     * Route PATCH request callback
     */
    public function patch()
    {
    }

    /**
     * Route DELETE request callback
     */
    public function delete()
    {
    }

    /**
     * Send API output.
     *
     * @param string $data
     * @param ?array $headers
     * @param int $code
     */
    protected function send_output($data, $headers = null, $code = 200)
    {
        if ($code >= 400) {
            http_response_code($code);
        }

        if (!$headers || !is_array($headers)) {
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
    protected function send_file($filepath, $headers, $code = 200)
    {
        if ($code >= 400) {
            http_response_code($code);
        }

        if (!is_file($filepath)) {
            http_response_code(404);
        }

        if (!is_array($headers)) {
            $headers = $this->get_headers($_SERVER['REQUEST_METHOD']);
        } else {
            $headers = array_reduce(array_keys($headers), function ($carry, $header) use ($headers) {
                if ($headers[$header]) $carry[$header] = $headers[$header];
                return $carry;
            }, $this->get_headers($_SERVER['REQUEST_METHOD']));
        }

        foreach ($headers as $header => $value) {
            header("$header: $value");
        }

        $filename = basename($filepath);
        header("Content-disposition: attachment; filename=$filename");
        $size = filesize($filepath);
        header("Content-Length: $size");

        if (is_file($filepath)) {
            readfile($filepath);
        }
        exit;
    }

    /**
     * Get API response http headers
     *
     * @param string $method
     */
    protected function get_headers($method)
    {
        return [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => VOCERO_ORIGINS,
            'Access-Control-Allow-Methods' => implode(', ', $this->methods),
            'Access-Control-Allow-Headers' => 'Content-Type',
        ];
    }

    protected function handle_http_exception(Exception $e)
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

<?php
require_once VOCERO_API_ROOT . 'lib/Cache.php';
require_once VOCERO_API_ROOT . 'lib/Project.php';

use GuzzleHttp\Client;

class BaseResource
{
    protected $env;
    protected $endpoint;
    protected $cached = true;
    protected $cache_key;
    protected $cache = null;

    private $base_url = 'https://api.github.com';
    private $data = null;

    public $sha = null;

    public function __construct()
    {
        $this->env = (new Project())->get();

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);

        if ($this->cached && $this->cache === null) {
            $this->cache = new Cache($this->cache_key, $this->sha);
        }
    }

    /**
     * HTTP Request
     *
     * @param string $method
     */
    protected function request($method, $payload = null)
    {
        if ($method === 'GET') {
            if ($this->data) return $this->data;
            if ($this->cached && $this->cache->is_cached()) return $this->cache->get();
        }

        $client = new Client(['base_uri' => $this->base_url]);
        $settings = [
            'headers' => $this->get_headers($method),
        ];

        $payload = $this->get_payload($method, $payload);
        if ($payload) {
            $settings['body'] = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        $query = $this->get_query($method);
        if ($query) {
            $settings['query'] = $query;
        }

        $sink = $this->get_sink($method);
        if ($sink) {
            $sink = fopen($sink, 'w');
            $settings['sink'] = $sink;
        }

        try {
            $response = $client->request($method, $this->get_endpoint($method), $settings);
        } catch (Exception $e) {
            throw $e;
        } finally {
            if ($sink && is_resource($sink)) fclose($sink);
        }

        if ($sink) return [];

        $this->data = json_decode($response->getBody()->getContents(), true);

        if ($this->cached && $method !== 'DELETE') return $this->cache->post($this->data);
        return $this->data;
    }

    /**
     * HTTP GET Request
     */
    public function get()
    {
        return $this->request('GET');
    }

    /**
     * HTTP POST Request
     *
     * @param ?array $payload
     */
    public function post($payload = null)
    {
        return $this->request('POST', $payload);
    }

    /**
     * HTTP PUT Request
     *
     * @param ?array $payload
     */
    public function put($payload = null)
    {
        return $this->request('PUT', $payload);
    }

    /**
     * HTTP PATCH Request
     *
     * @param ?array $payload
     */
    public function patch($payload = null)
    {
        return $this->request('PATCH', $payload);
    }

    /**
     * HTTP DELETE Request
     */
    public function delete()
    {
        return $this->request('DELETE');
    }

    /**
     * Decorate data before json serialization
     *
     */
    protected function decorate()
    {
        return $this->get();
    }

    /**
     * Output content as json string
     */
    public function json()
    {
        $data = $this->decorate();
        return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Format resource endpoint
     *
     * @param string $method
     */
    protected function get_endpoint($method)
    {
        switch ($method) {
            case 'GET':
                return $this->endpoint;
            case 'POST':
                return $this->endpoint;
            case 'PUT':
                return $this->endpoint;
            case 'PATCH':
                return $this->endpoint;
            case 'DELETE':
                return $this->endpoint;
        }
    }

    /**
     * Get request headers
     *
     * @param string $method
     */
    protected function get_headers($method)
    {
        return [
            'Accept' => 'application/vnd.github+json',
            'Authorization' => 'Bearer ' . $this->env['GH_ACCESS_TOKEN'],
            'Content-Type' => 'application/json',
        ];
    }

    protected function get_payload($method, $data = null)
    {
        if (in_array($method, ['GET', 'DELETE'])) return null;

        return $data;
    }

    protected function get_query($method)
    {
        return null;
    }

    protected function get_sink($method)
    {
        return null;
    }
}

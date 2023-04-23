<?php
require_once VOCERO_API_ROOT . 'lib/Cache.php';
require_once VOCERO_API_ROOT . 'lib/Dotfile.php';

use GuzzleHttp\Client;

class BaseResource
{
    protected array $env;
    protected string $endpoint;
    protected bool $cached = true;
    protected string $cache_key;
    protected object $cache;

    private string $base_url = 'https://api.github.com';
    private ?array $data = null;

    public ?string $sha = null;

    public function __construct()
    {
        $this->env = (new Dotfile())->get();

        $this->endpoint = str_replace('$GH_USER', $this->env['GH_USER'], $this->endpoint);
        $this->endpoint = str_replace('$GH_REPO', $this->env['GH_REPO'], $this->endpoint);

        if ($this->cached) {
            $this->cache = new Cache($this->cache_key, $this->sha);
        }
    }

    /**
     * HTTP Request
     *
     * @param string $method
     * @param mixed $payload
     */
    private function request(string $method): array
    {
        if ($method === 'GET') {
            if ($this->data) return $this->data;
            if ($this->cached && $this->cache->is_cached()) return $this->cache->get();
        }

        $client = new Client(['base_uri' => $this->base_url]);
        $settings = [
            'headers' => $this->get_headers($method),
        ];
        $payload = $this->get_payload($method);
        if ($payload) {
            $settings['body'] = $payload;
        }

        $response = $client->request($method, $this->get_endpoint($method), $settings);

        $this->data = json_decode($response->getBody()->getContents(), true);

        if ($this->cached && $method !== 'DELETE') return $this->cache->post($this->data);
        return $this->data;
    }

    /**
     * HTTP GET Request
     */
    public function get(): array
    {
        return $this->request('GET');
    }

    /**
     * HTTP POST Request
     *
     * @param mixed $payload
     */
    public function post(): array
    {
        return $this->request('POST');
    }

    /**
     * HTTP PUT Request
     *
     * param mixed $payload
     */
    public function put(): array
    {
        return $this->request('PUT');
    }

    /**
     * HTTP PATCH Request
     *
     * @param mixed $payload
     */
    public function patch(): array
    {
        return $this->request('PATCH');
    }

    /**
     * HTTP DELETE Request
     */
    public function delete(): array
    {
        return $this->request('DELETE');
    }

    /**
     * Decorate data before json serialization
     *
     */
    protected function decorate(?array $data = null): array
    {
        if (!$data) return $this->get();
        return $data;
    }

    /**
     * Output content as json string
     */
    public function json(): string
    {
        $data = $this->decorate();
        return json_encode($data);
    }

    /**
     * Format resource endpoint
     *
     * @param string $method
     */
    protected function get_endpoint(string $method): string
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
    protected function get_headers(string $method): array
    {
        return [
            'Accept' => 'application/vnd.github+json',
            'Authorization' => 'Bearer ' . $this->env['GH_ACCESS_TOKEN']
        ];
    }

    protected function get_payload(string $method): ?array
    {
        return null;
    }
}

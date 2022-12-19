<?php

class Dotfile
{

    private $path = null;
    private $public = array(
        'GH_BRANCH',
        'GH_USER',
        'GH_REPO',
        'GH_DOMAIN',
        'GH_EMAIL',
        'GH_INIT'
    );

    function __construct($path = null)
    {
        if ($path) {
            $this->path = $path;
        } else {
            $this->path = realpath(__DIR__ . DS . '..' . DS . '.env');
        }
    }

    private function format($value, $mode = 'r')
    {
        if ($mode == 'r') {
            return $value === '' ?
                null : ($value === 'false' ?
                    false : ($value === 'true' ?
                        true : $value));
        } else {
            return $value === null ?
                '' : ($value === false ?
                    'false' : ($value === true ?
                        'true' : $value));
        }
    }

    private function read()
    {
        $envfile = fopen($this->path, "r");
        $content = fread($envfile, filesize($this->path));
        fclose($envfile);
        $env = array();

        foreach (explode(PHP_EOL, $content) as $l) {
            if (!$l) {
                continue;
            }
            $pair = explode('=', $l);
            $env[$pair[0]] = $this->format($pair[1]);
        }

        return $env;
    }

    private function write($env)
    {
        $content = "";
        foreach (array_keys($env) as $name) {
            $content .= $name . '=' . $this->format($env[$name], 'w') . PHP_EOL;
        }

        $envfile = fopen($this->path, 'w');
        fwrite($envfile, $content);
        fclose($envfile);
    }

    public function get()
    {
        return $this->read();
    }

    public function post($name, $value)
    {
        $env = $this->read();
        $env[$name] = $value;
        $this->write($env);

        return $this->get();
    }

    public function put($name, $value)
    {
        $env = $this->read();
        if (in_array($name, array_keys($env))) {
            $env[$name] = $value;
        }
        $this->write($env);

        return $this->get();
    }

    public function json()
    {
        $data = $this->get();
        $response = array();
        foreach (array_keys($data) as $key) {
            if (in_array($key, $this->public)) {
                $response[$key] = $data[$key];
            }
        }

        return json_encode($response);
    }
}

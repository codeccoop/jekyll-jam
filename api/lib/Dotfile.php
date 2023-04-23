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
            $this->path = VOCERO_API_ROOT . '../.env';
        }

        if (!file_exists($this->path)) {
            $tmp = fopen($this->path, "w") or die("Unable to open file!");
            fclose($tmp);
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

    private function read_file()
    {
        try {
            $dotfile = fopen($this->path, "r");
        } catch (Exception $e) {
            $dotfile = fopen($this->path, "w") or die("Unable to open file!");
        }

        $filesize = filesize($this->path);
        if ($filesize > 0) {
            $content = fread($dotfile, filesize($this->path));
        } else {
            $content = "";
        }

        fclose($dotfile);

        return $content;
    }

    private function read()
    {
        $content = $this->read_file();
        $env = array();

        foreach (explode(PHP_EOL, $content) as $l) {
            if (!$l) {
                continue;
            }
            $pair = explode('=', $l);
            $env[$pair[0]] = $this->format($pair[1]);
        }

        $env['GH_INIT'] = isset($env['GH_INIT']) ? $env['GH_INIT'] : false;

        return $env;
    }

    private function write($env)
    {
        $content = "";
        foreach (array_keys($env) as $name) {
            $content .= $name . '=' . $this->format($env[$name], 'w') . PHP_EOL;
        }

        $dotfile = fopen($this->path, 'w');
        fwrite($dotfile, $content);
        fclose($dotfile);
    }

    public function get()
    {
        return $this->read();
    }

    public function post($entries)
    {
        $env = $this->read();
        foreach ($entries as $key => $val) {
            $env[$key] = $val;
        }
        $this->write($env);

        return $this->get();
    }

    public function put($entries)
    {
        $env = $this->read();
        foreach ($entries as $key => $value) {
            if (in_array($key, array_keys($env))) {
                $env[$key] = $value;
            }
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

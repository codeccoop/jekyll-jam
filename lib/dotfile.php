<?php

class Dotfile
{

    private $path = null;

    function __construct($path = null)
    {
        if ($path) {
            $this->path = $path;
        } else {
            $this->path = realpath(__DIR__ . '/../.env');
        }
    }

    public function get()
    {
        try {
            $envfile = fopen($this->path, "r");
            $content = fread($envfile, filesize($this->path));
            fclose($envfile);
            $env = array();
            foreach (explode(PHP_EOL, $content) as $l) {
                if (!$l) {
                    continue;
                }
                $pair = explode('=', $l);
                $env[$pair[0]] = $pair[1];
            }

            return $env;
        } catch (Exception $e) {
            echo $e;
        }
    }
}

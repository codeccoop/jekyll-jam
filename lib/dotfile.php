<?php

class Dotenv
{

    private $path = '.env';

    function __construct($path = '.env')
    {
        if ($path) {
            $this->path = $path;
        }
    }

    public function get()
    {
        try {
            $envfile = fopen($this->path, "r");
            $content = fread($envfile, filesize(".env"));
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

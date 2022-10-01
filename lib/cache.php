<?php
define('DS', DIRECTORY_SEPARATOR);

class Cache
{
    private $base_path;
    private $path;
    private $content;

    public $sha;

    function __construct($file_path, $sha = null)
    {
        $this->base_path = realpath(__DIR__ . DS . '..' . DS . '.cache');

        if ($sha != null) {
            $this->sha = $sha;
        }

        $this->path = $this->base_path . DS . join(DS, explode('/', $file_path));
        $dirname = pathinfo($this->path)['dirname'];

        if ($dirname != $this->base_path) {
            $this->mkdir($dirname);
        }
    }

    private function mkdir($dirname)
    {
        $acum = '';
        foreach (array_slice(explode(DS, $dirname), 1) as $dir) {
            $acum .= DS . $dir;
            if (!is_dir($acum)) {
                mkdir($acum, 0750, true);
            }
        }
    }

    private function open($mode, $content = null)
    {
        if ($mode === 'w') {
            $file = fopen($this->path, 'w');
            fwrite($file, json_encode($content));
            return $content;
        } else {
            if (!file_exists($this->path)) return null;;
            $file = fopen($this->path, 'r');
            return json_decode(fread($file, filesize($this->path)), true);
        }
    }

    private function rmDir($dir)
    {
        if (!is_dir($dir)) {
            throw new InvalidArgumentException("$dir must be a directory");
        }
        if (substr($dir, strlen($dir) - 1, 1) != '/') {
            $dir .= '/';
        }
        $files = glob($dir . '*', GLOB_MARK);
        foreach ($files as $file) {
            if (is_dir($file)) {
                $this->rmDir($file);
            } else {
                unlink($file);
            }
        }
        set_error_handler(function () {
        });
        rmdir($dir);
        restore_error_handler();
    }

    public function is_cached()
    {
        if ($this->content === null) {
            $this->content = $this->open('r');
            if ($this->content === null) {
                return false;
            }
        }

        if ($this->sha === null) return $this->content;
        return $this->content['sha'] === $this->sha;
    }

    public function get()
    {
        if ($this->content !== null) return $this->content;
        if ($this->is_cached() === true) return $this->content;
    }

    public function post($content)
    {
        $this->content = $this->open('w', $content);
        return $this->content;
    }

    public function reset()
    {
        $this->rmDir($this->base_path);
        # mkdir($this->base_path, 0750, false);
    }
}

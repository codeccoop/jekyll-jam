<?php
class Cache
{
    public $base_path = VOCERO_API_ROOT . '../.cache';
    private $path;
    private $content;

    public $sha = null;

    public function __construct($file_path, $sha = null)
    {
        $this->path = $this->base_path . '/' . $file_path;
        $dirname = pathinfo($this->path)['dirname'];

        if ($dirname != $this->base_path) {
            $this->mkdir($dirname);
        }

        if ($sha != null) {
            $this->sha = $sha;
        } else if (isset($this->content['sha'])) {
            $this->sha = $this->content['sha'];
        }

        $this->content = $this->open('r');
        if (!$this->content) {
            $this->open('w', []);
        }
    }

    private function mkdir($dirname)
    {
        $acum = '';
        foreach (array_slice(explode('/', $dirname), 1) as $dir) {
            $acum .= '/' . $dir;
            if (!is_dir($acum)) {
                mkdir($acum, 0750, true);
            }
        }
    }

    private function open($mode, $content = null)
    {
        if ($mode === 'w') {
            if ($content === null) return $content;
            $file = fopen($this->path, 'w');
            fwrite($file, json_encode($content));
            fclose($file);
            return $content;
        } else if ($mode === 'r') {
            if (!file_exists($this->path)) return null;;
            $file = fopen($this->path, 'r');
            $size = filesize($this->path);
            if ($size === 0) return null;
            $content = json_decode(fread($file, $size), true);
            if (!$content || count(array_keys($content)) === 0) return null;
            fclose($file);
            return $content;
        } else if ($mode === 't') {
            if (!file_exists($this->path)) return null;;
            $handle = fopen($this->path, 'r+');
            ftruncate($handle, 1);
            fclose($handle);
            return null;
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
            return false;
        }

        if ($this->sha === null) return true;
        return $this->content['sha'] === $this->sha;
    }

    public function get()
    {
        if ($this->content !== null) return $this->content;
        if ($this->is_cached() === true) return $this->content;
    }

    public function post(array $content)
    {
        $this->content = $this->open('w', $content);
        return $this->content;
    }

    public function truncate()
    {
        $this->open('t');
    }

    public function reset()
    {
        $this->rmDir($this->base_path);
        # mkdir($this->base_path, 0750, false);
    }
}

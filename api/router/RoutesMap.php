<?php

class RoutesMap implements ArrayAccess
{
    private $routes = [];

    public function __construct($routes)
    {
        $this->routes = $routes;
    }

    public function offsetExists($offset)
    {
        return isset($this->routes[$offset]);
    }

    public function offsetGet($offset)
    {
        if ($this->offsetExists($offset)) {
            return $this->routes[$offset]();
        }

        return null;
    }

    public function offsetSet($offset, $value)
    {
        return;
    }

    public function offsetUnset($offset)
    {
        return;
    }
}

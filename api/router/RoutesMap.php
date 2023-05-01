<?php

class RoutesMap implements ArrayAccess
{
    private array $routes = [];

    public function __construct(array $routes)
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

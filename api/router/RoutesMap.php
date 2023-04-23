<?php

class RoutesMap implements ArrayAccess
{
    private array $routes = [];

    public function __construct(array $routes)
    {
        $this->routes = $routes;
    }

    public function offsetExists(mixed $offset): bool
    {
        return isset($this->routes[$offset]);
    }

    public function offsetGet(mixed $offset): mixed
    {
        if ($this->offsetExists($offset)) {
            return $this->routes[$offset]();
        }

        return null;
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
        return;
    }

    public function offsetUnset(mixed $offset): void
    {
        return;
    }
}

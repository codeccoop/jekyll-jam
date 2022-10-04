<?php
$path = 'https://api.github.com/repos/lucasgarciabaro/jekyll-jam/actions/runs/3178709478/artifacts';
preg_match('/(?<=\/)[0-9]+(?=\/)/', $path, $matches);

echo print_r($matches);

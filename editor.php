<?php
include_once realpath(__DIR__ . '/inc/head.php');
require_once realpath(__DIR__ . '/lib/blob.php');

$query = array_reduce(explode('&', $_SERVER['QUERY_STRING']), function ($acum, $param) {
    $keyvalue = explode('=', $param);
    $acum[$keyvalue[0]] = $keyvalue[1];
    return $acum;
}, array());

(new Blob($query['sha'], base64_decode($query['path'])))->render();
?>
<div class="edit-page"></div>

<?php
include_once realpath(__DIR__ . '/inc/foot.php');

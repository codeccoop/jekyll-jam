<?php
include_once 'inc/head.php';
require_once 'lib/blob.php';

$query = array_reduce(explode('&', $_SERVER['QUERY_STRING']), function ($acum, $param) {
    $keyvalue = explode('=', $param);
    $acum[$keyvalue[0]] = $keyvalue[1];
    return $acum;
}, array());
(new Blob($query['sha']))->render();
?>
<div class="edit-page"></div>

<?php
include_once 'inc/foot.php';

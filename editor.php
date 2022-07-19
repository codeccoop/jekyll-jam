<?php
include_once 'inc/head.php';
require_once 'lib/blob.php';

$query = array_reduce(explode('&', $_SERVER['QUERY_STRING']), function ($acum, $param) {
    $keyvalue = explode('=', $param);
    $acum[$keyvalue[0]] = $keyvalue[1];
    return $acum;
}, array());

# $blob_sha = 'f5e50fd020a229cb47b4498f3f1460afd7b23992';

?>
<template id="blob" data-filename="<?= $query['filename']; ?>" data-sha="<?= $query['sha']; ?>"><?= (new Blob($query['sha']))->content(); ?></template>
<main id="content"></main>

<script>
    <?php include_once 'static/js/editor.js'; ?>
</script>
<?php
include_once 'inc/foot.php';

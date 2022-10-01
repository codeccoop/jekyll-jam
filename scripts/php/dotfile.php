<?php

$pair = explode('=', 'GH_DOMAIN=true');
$data = array();
$data[$pair[0]] = $pair[1] == '' ?
    null : ($pair[1] == 'false' ?
        false : ($pair[1] == 'true' ?
            true :
            $pair[1]));

echo json_encode($data);

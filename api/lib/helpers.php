<?php

function encodeURIComponent($str)
{
    $revert = array('%21' => '!', '%2A' => '*', '%27' => "'", '%28' => '(', '%29' => ')');
    return strtr(rawurlencode($str), $revert);
}

function decodeURIComponent($str)
{
    $revert = array('!' => '%21', '*' => '%2A', "'" => '%27', '(' => '%28', ')' => '%29');
    return urldecode(strtr($str, $revert));
}

function b64e($str)
{
    return base64_encode(encodeURIComponent($str));
}

function b64d($str)
{
    return base64_decode(decodeURIComponent($str));
}

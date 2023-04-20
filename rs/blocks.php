<?php
header('Allow: GET');
header('Content-Type: text/javascript');

if ('GET' != $_SERVER['REQUEST_METHOD']) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 405 Method Not Allowed');
    echo '{"status": "error", "message": "405 Method Not Allowed"}';
    exit;
}

define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . '..' . DS . 'lib' . DS . 'blocks.php');

try {
    echo (new Blocks($_GET['sha']))->get();
} catch (Exception $e) {
    echo '[{
        family: "media",
        name: "CustomVideo",
        level: "block",
        args: ["url", "width", "height"],
        selfClosed: true,
        // fn: ({ React, src, width = "500px", height = "auto" }, ref) => React.createElement("video", {src, width, height}),
        fn: ({ React, src, width = "500px", height = "auto" }) => React.createElement("video", {width, height}, React.createElement("source", {src,type:"video/mp4"})),
    }, {
        family: "layout",
        name: "Columns",
        level: "block",
        args: [],
        selfClosed: false,
        // fn: ({ React, children }, ref) => React.createElement("div", {ref,className:"columns",style:{display:"flex",width:"100%"}}, children),
        fn: ({ React, children }) => React.createElement("div", {className:"columns",style:{display:"flex",width:"100%"}}, children),
    }, {
        family: "layout",
        name: "Column",
        level: "block",
        args: ["span", "gutter"],
        selfClosed: false,
        // fn: ({ React, span = 1, gutter = "0", children }, ref) => React.createElement("div", {className:"column",style:{display:"block",flex:span ? span : 1,padding:gutter ? gutter : "0"}}, children)
        fn: ({ React, span = 1, gutter = "0", children }) => React.createElement("div", {className:"column",style:{display:"block",flex:span ? span : 1,padding:gutter ? gutter : "0"}}, children)
    }]';
    /* header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found'); */
    /* header('Content-Type: application/json'); */
    /* echo '{"status": "error", "message": "Blocks js file not found"}'; */
}

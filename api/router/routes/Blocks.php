<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';



class BlocksRoute extends BaseRoute
{
    public array $methods = ['GET'];

    private string $blocks_js = '[{
    family: "media",
    name: "CustomVideo",
    level: "block",
    args: ["url", "width", "height"],
    selfClosed: true,
    fn: ({ React, src, width = "500px", height = "auto" }) => React.createElement("video", {width, height}, React.createElement("source", {src,type:"video/mp4"})),
}, {
    family: "layout",
    name: "Columns",
    level: "block",
    args: [],
    selfClosed: false,
    fn: ({ React, children }) => React.createElement("div", {className:"columns",style:{display:"flex",width:"100%"}}, children),
}, {
    family: "layout",
    name: "Column",
    level: "block",
    args: ["span", "gutter"],
    selfClosed: false,
    fn: ({ React, span = 1, gutter = "0", children }) => React.createElement("div", {className:"column",style:{display:"block",flex:span ? span : 1,padding:gutter ? gutter : "0"}}, children)
}]';

    public function get(): void
    {
        $this->send_output($this->blocks_js);
    }
}

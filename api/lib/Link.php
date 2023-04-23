<?php

class Anchor
{
    static public string $rule = '/<a[\s]+([^>]+)>((?:.(?!\<\/a\>))*.)<\/a>/';


    private array $components = [];

    function __construct($html)
    {
        preg_match(Anchor::$rule, $html, $this->components);
        if (sizeof($this->components) === 0) throw new Exception("Bad anchor format");

        $this->source = $html;
    }
}

class Link
{
    /* static public $rules = array( */
    /*     'link' => '/^!?\[((?:\[(?:.|[^\[\]])*\]|.|`[^`]*`|[^\[\]`])*?)\]\(\s*(<(?:.|[^\n<>])+>|[^\s\x00-\x1f]*)(?:\s+("(?:"?|[^"])*"|\'(?:\'?|[^\'])*\'|\((?:\)?|[^)])*\)))?\s*\)/', */
    /*     'reflink' => '/^!?\[((?:\[(?:.|[^\[\]])*\]|.|`[^`]*`|[^\[\]`])*?)\]\[((?!\s*\])(?:.|[^\[\]])+)\]/', */
    /*     'nolink' => '/^!?\[((?!\s*\])(?:.|[^\[\]])+)\](?:\[\])?/', */
    /* ); */

    static public $rule = '/^!?\[((?:\[(?:.|[^\[\]])*\]|.|`[^`]*`|[^\[\]`])*?)\]\(\s*(<(?:.|[^\n<>])+>|[^\s\x00-\x1f]*)(?:\s+("(?:"?|[^"])*"|\'(?:\'?|[^\'])*\'|\((?:\)?|[^)])*\)))?\s*\)/';
    private $components = [];
    public $children = [];

    function __construct($md)
    {
        preg_match(Link::$rule, $md, $this->components);
        if (sizeof($this->components) == 0) throw new Exception("Bad link format");

        $this->source = $md;
        $this->children = Link::get_line_links($this->get_text());
    }

    public function get_text()
    {
        if (sizeof($this->components) >= 1) return $this->components[1];
        return null;
    }

    public function get_href()
    {
        if (sizeof($this->components) >= 2) return $this->components[2];
        return null;
    }

    public function get_title()
    {
        if (sizeof($this->components) == 3) return $this->components[3];
        return null;
    }

    public function get_children($children = [])
    {
        foreach ($this->children as $child) {
            if (sizeof($child->children) > 0) $child->get_children($children, $children);
            $children[] = $child;
        }

        return $children;
    }

    public function as_absolute()
    {
        $href = $this->get_href();
        $url = parse_url($href);
        if (isset($url['host'])) return $this->source;
        if ($url['path'][0] == '/') return str_replace($href, '{{ site.baseurl }}' . $href, $this->source);
        return str_replace($href, '{{ site.baseurl }}/' . $href, $this->source);
    }

    static function get_line_links($line, $links = [])
    {
        $links = [];
        $parsed_line = str_trim($line);
        $i = 0;
        while (strlen($parsed_line) > 0) {
            preg_match(Link::$rule, $parsed_line, $match);
            if (sizeof($match) > 0) {
                $links[] = new Link(...$match);
                $parsed_line = str_replace($match[0], '', $parsed_line);
            }

            preg_match('/^[^\s\n\r]+(\s|\n|\r)+/', $parsed_line, $chunk);
            if (sizeof($chunk) > 0) {
                $parsed_line = str_trim(substr($parsed_line, strlen($chunk[0])));
            }

            preg_match('/^[^\s\n\r]+$/', $parsed_line, $end_match);
            if (sizeof($end_match)) break;
            $i++;
        }

        return $links;
    }

    static function get_links($markdown, $links = [])
    {
        // $code_scaped = '';
        $skip_code_block = false;
        foreach (preg_split('/\n|\r/', $markdown) as $line) {
            if ($skip_code_block) {
                preg_match('/^\s*`{1,3}/', $line, $is_code_block);
                if ($is_code_block) {
                    $skip_code_block = false;
                }
                continue;
            }

            preg_match('/^\s*`{1,3}/', $line, $is_code_block);
            if ($is_code_block) {
                $skip_code_block = true;
                continue;
            }

            foreach (Link::get_line_links($line) as $link) {
                $links[] = $link;
            }

            // $code_scaped .= preg_replace('/\s`(.(?!`))*.`/', '', $line);
        }

        return $links;
    }

    static public function get_hlinks($md)
    {
        $urls = [];
        preg_match_all('/(?:src|href|srcset)=(\'((?:.(?!\'))*.)\'|"((?:.(?!"))*.)")/', $md, $matches);
        foreach ($matches as $match) {
            $urls[] = $match[1];
        }

        return $urls;
    }
}

class HLink
{
    static public $rule = '/(?:src|href|srcset)=(\'(?:.(?!\'))*.\'|"(?:.(?!"))*.")/';
    # static public $rule = '/(?:src|href|srcset)=(?:\'((?:.(?!\'))*.)\'|"((?:.(?!"))*.)")/';
    private $components = [];

    function __construct($src)
    {
        $this->source = $src;
        $this->components = parse_url($src);
    }

    function is_absolute()
    {
        return isset($this->components['host']);
    }

    function is_root()
    {
        return isset($this->components['path']) ? $this->components['path'][0] == '/' : false;
    }

    function as_absolute()
    {
        if ($this->is_absolute()) return $this->source;
        if ($this->is_root()) return '{{ site.baseurl }}' . $this->source;
        return '{{ site.baseurl }}/' . $this->source;
    }

    static public function get_hlinks($md)
    {
        $hlinks = [];
        preg_match_all(HLink::$rule, $md, $matches);
        foreach ($matches[1] as $match) {
            if ($match && strlen($match) > 0) {
                $hlinks[] = new HLink(preg_replace('/^(\'|")/', '', preg_replace('/(\'|")$/', '', $match)));
            }
        }

        return $hlinks;
    }
}

function str_trim($str)
{
    return preg_replace('/^(\s|\n|\r)*/', '', preg_replace('/(\s|\n|\r)*$/', '', $str));
}

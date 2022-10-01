<?php
define('DS', DIRECTORY_SEPARATOR);

require_once realpath(__DIR__ . DS . 'dotfile.php');
require_once realpath(__DIR__ . DS . 'content.php');

class Workflow
{

    private $env;
    private $config_path = '.github/workflows/jekyll-docker.yml';
    private $content;

    function __construct()
    {
        $this->env = (new Dotfile())->get();
    }

    public function put($branches = null)
    {
        if ($this->content) {
            return $this->content->get();
        }

        if ($branches == null) {
            $branches = array($this->env['GH_BRANCH']);
        }

        $this->content = new Content($this->config_path);
        return $this->content->put($this->config_template($branches));
    }

    private function config_template($branches = array('main'))
    {

        return array(
            'name' => 'Jekyll site CI',
            'on' => array(
                'push' => array(
                    'branches' => $branches
                ),
                'pull_request' => array(
                    'branches' => $branches
                )
            ),
            'jobs' => array(
                'build' => array(
                    'runs-on' => 'ubuntu-latest',
                    'steps' => array(
                        array('uses' => 'actions/checkout@v3'),
                        array(
                            'name' => 'Build the site in the jekyll/builder container',
                            'run' => 'docker run \
    -v ${{ github.workspace }}:/srv/jekyll -v ${{ github.workspace }}/_site:/srv/jekyll/_site \
    jekyll/builder:latest /bin/bash -c "cmod -R 777 /srv/jekyll && jekyll build --future"'
                        )
                    )
                )
            )
        );
    }
}

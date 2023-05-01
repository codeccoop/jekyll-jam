<?php

require_once VOCERO_API_ROOT . 'router/routes/BaseRoute.php';
require_once VOCERO_API_ROOT . 'resources/Branch.php';
require_once VOCERO_API_ROOT . 'resources/Ref.php';
require_once VOCERO_API_ROOT . 'resources/Repo.php';
require_once VOCERO_API_ROOT . 'resources/Page.php';
require_once VOCERO_API_ROOT . 'resources/Tree.php';
require_once VOCERO_API_ROOT . 'resources/Config.php';
require_once VOCERO_API_ROOT . 'lib/Project.php';
require_once VOCERO_API_ROOT . 'lib/helpers.php';

class InitRoute extends BaseRoute
{
    public $methods = ['GET'];

    public function get()
    {
        $project = new Project();
        $env = $project->get();

        if (isset($env['GH_INIT']) && $env['GH_INIT']) {
            $this->send_output('{"success": true}');
        }


        $repo = new Repo();
        try {
            $repo->get();
        } catch (Exception $e) {
            if ($e->getCode() === 404) {
                $template = isset($env['GH_TEMPLATE']) ? $env['GH_TEMPLATE'] : false;
                $repo->post([
                    'name' => $env['GH_REPO'],
                    'template_slug' => $template
                ]);
            } else {
                $this->handle_http_exception($e);
            }
        }

        try {
            $branch = (new Branch())->get();
        } catch (Exception $e) {
            if ($e->getCode() === 404) {
                $default = $this->branch_searcher($repo->default_branch());
                (new Ref())->post(['commit_sha' => $default['commit']['sha']]);
                $branch = (new Branch())->get();
            } else {
                $this->handle_http_exception($e);
            }
        }

        $tree = (new Tree($branch['commit']['sha']))->get();

        $node = Config::get_tree_node($tree);
        if (!$node) {
            $this->handle_http_exception(new Exception("Config file not found", 404));
        }

        $sha = $node['sha'];
        $config = new Config($sha);
        $settings = $config->get();

        $settings['baseurl'] = get_base_url($env);
        (new Config($sha))->put($settings);

        $page = new Page();
        try {
            $data = $page->get();
            if ($data['source']['branch'] != $env['GH_BRANCH']) {
                $page->put(['branch' => $env['GH_BRANCH']]);
            }
        } catch (Exception $e) {
            if ($e->getCode() === 404) {
                $page->post($env['GH_BRANCH']);
            } else {
                $this->handle_http_exception($e);
            }
        }

        $project->post(['GH_INIT' => true]);

        $this->send_output('{"success": true}');
    }


    private function branch_searcher($branch, $try = 0)
    {
        if ($try < 10) {
            try {
                return (new Branch($branch))->get();
            } catch (Exception $e) {
                if ($e->getCode() === 404) {
                    sleep(2);
                    return $this->branch_searcher($branch, $try + 1);
                } else {
                    $this->handle_http_exception($e);
                }
            }
        } else {
            $e = new Exception("Timeout error while getting the repo branch", 408);
            $this->handle_http_exception($e);
        }
    }
}

:warning: Under developmen
---

This project is at its first development steps. It isn't ready yet, but we are excited with it and we will put houres in its development. Take this README as a road map of all features we want to cover with this software.

# Vocero
![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)
  
The Jekyll CMS interactive editor boosted by [GitHub](https://github.com)

## Users
### Why Vocero?
[Jekyll](https://jekyllrb.com/) is a simple, blog-aware, static site generator. Jekyll renders Markdown and Liquid
templates and spits out a complete, static website ready to be served as static files based
web site, light, fast and secure.

Jekyll is so :cool:, if you have some techie background. If not, it's not very friendly.
Vocero comes to fill this gap and allow users to build their own web for free, without
software installation, domains and dns configuration neither hosting plans.

### How to use it?
Create a new project with [Còdec](https://codeccoop.org/jekyll-jam) or with any other Vocero
provider you know. At your first time in the editor, Vocero will require you to configure the
project. It will take you throughout a process to syncronize your project with GitHub and define
wich deployment mode you want tu use and what [Jekyll Theme](https://jekyllrb.com/docs/themes/)
you want to use for your brand new site.

### Deployment modes
#### GitHub page
GitHub offers their [GitHub Pages](https://pages.github.com/) as a free service to publish your repository content on the web.
GitHub pages is running on top of Jekyll to compile your code and get a complete web site. With
GitHub Pages you can host your page for free on GitHub, using their domain, or bind your page to
a domain of your own and get it on the web without traces of GitHub.

#### FTP hosting
With [GitHub Workflows](https://docs.github.com/en/actions/using-workflows), we can compile the Jekyll templeates into a web page and then perform
a continious integration with your host using FTP. If you prefer to own your own host and domain
and use Vocero as your CMS, this is your option.

#### Arhive File
Use Vocero as a content editor, GitHub as a compile environment, and get the result compressed
as a zip file to make what you want with it.

## Providers
### Installation
Download Vocero from this [link](https://github.com/codeccoop/jekyll-jam/archive/refs/heads/main.zip).
Unzip the content of the downloaded archive into your server root directory and name it as `jekyll-jam`.
Then, navigate to `http://yourdomain.ltd/jekyll-jam/admin` and follow the instructions to get
your Vocero instance ready.

## Developers


From the root directory install php dependencies with

```bash
composer install
```

Enter the client directory, install js dependencies and start a node server listening on port 3000 and
watching for changes that will output bundles to the `static` directories.

```bash
cd client && npm install && npm start
```

Then, open a new console and start the php server.

```bash
php -S localhost:8000
```

To test your instance running inside apache, start your environment using docker. Docker will be listening
on the ssl port 443 with a self signed certificate.

```bash
bin/docker-cli run
```

## Config

Place a `.env` file with

```bash
GH_ACCESS_TOKEN=<github-access-token>
GH_USER=<github-user>
GH_EMAIL=<github-user-email>
GH_REPO=<github-repo>
GH_BRANCH=<github-branch>
GH_DOMAIN=(repo|<your-custom-domain>)
```

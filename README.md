# Jekyll JAM

A Jekyll interactive editor based on php boosted by GitHub API

## Build

Enter the client directory, install js dependencies and build the client

```bash
npm install && npm run build
```

Back to the root directory install php dependencies with

```bash
composer install
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

## Deploy

Content to be deployed is:

```
root
|   .htaccess
|   index.html
└───api
└───lib
└───rs
└───static
└───vendor
```

# Jekyll JAM

A Jekyll interactive editor based on php boosted by GitHub API

## Build

Enter the client directory and run

```bash
npm install && npm run build
```

From the root directory run

```bash
composer install
```

## Config

Place a `.env` file with

```bash
GH_USER=<github-user>
GH_EMAIL=<github-user-email>
GH_REPO=<github-repo>
GH_ACCESS_TOKEN=<github-access-token>
```

## Deploy

Place all directory content into your host (excluding the `client/` directory content)

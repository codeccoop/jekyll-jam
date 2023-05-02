<?php

const VOCERO_DEPLOYMENT_FILES = [
    'index.html',
    '.env',
    '.project',
    '.htaccess',
];

const VOCERO_DEPLOYMENT_DIRS = [
    'api',
    'static',
    'vendor'
];

function vocero_is_deployable($path)
{
    $deployable = array_reduce(VOCERO_DEPLOYMENT_DIRS, function ($carry, $dir) use ($path) {
        return $carry || strpos($path, $dir) === 0;
    }, false);

    $deployable = array_reduce(VOCERO_DEPLOYMENT_FILES, function ($carry, $file) use ($path) {
        return $carry || $path === $file;
    }, $deployable);

    return $deployable;
}

function vocero_traverse_directory($path = null, &$carry = [])
{
    if (!$path) {
        $path = VOCERO_API_ROOT . '../';
    }

    $directories = [];
    foreach (scandir($path) as $entry) {
        if ($entry === '.' || $entry === '..') continue;

        $subpath = $path . $entry;
        if (is_dir($subpath)) {
            $directories[] = $subpath . '/';
        } else {
            $carry[] = $subpath;
        }
    }

    foreach ($directories as $dir) {
        vocero_traverse_directory($dir, $carry);
    }

    return $carry;
}

function vocero_ftp_mkdir($ftp, $directory)
{
    $path = $_ENV['VOCERO_FTP_PATH'];
    $chunks = explode('/', str_replace($path . '/', '', $directory));

    $changes = [];
    while ($path !== $directory) {
        $chunk = array_shift($chunks);
        $path = $path . '/' . $chunk;
        if (ftp_nlist($ftp, $path) === false) {
            $success = ftp_mkdir($ftp, $path);
            if ($success === false) {
                throw new Exception("FTP mkdir $directory has failed!");
            } else {
                $changes[] = $path;
            }
        }
    }

    return $changes;
}

function vocero_ftp_deployment()
{
    $ftp_server = $_ENV['VOCERO_FTP_HOST'];
    $ftp = ftp_connect($ftp_server);

    $ftp_user = $_ENV['VOCERO_FTP_USR'];
    $ftp_pwd = $_ENV['VOCERO_FTP_PWD'];
    $login_result = ftp_login($ftp, $ftp_user, $ftp_pwd);

    if (!($ftp && $login_result)) {
        throw new Exception("FTP connection has failed!. Attempted to connect to $ftp_server for user $ftp_user", 500);
    }

    ftp_pasv($ftp, true);

    $paths = vocero_traverse_directory();

    $directories = [];
    $base = $_ENV['VOCERO_FTP_PATH'];
    foreach ($paths as $path) {
        $relative_path = str_replace(VOCERO_API_ROOT . '../', '', $path);
        if (!vocero_is_deployable($relative_path)) continue;

        $remote_path = $base . '/' . $relative_path;
        if (!in_array(dirname($remote_path), $directories)) {
            foreach (vocero_ftp_mkdir($ftp, dirname($remote_path)) as $directory) {
                $directories[] = $directory;
            }
        }

        $success = ftp_put($ftp, $remote_path, $path, FTP_BINARY);
        if (!$success) {
            throw new Exception("FTP upload $remote_path from $path has failed!");
        }
    }

    ftp_close($ftp);
}

function vocero_zip_deployment()
{
    $zip = new ZipArchive();
    $filepath = VOCERO_API_ROOT . '../vocero.zip';

    if ($zip->open($filepath, ZipArchive::CREATE) !== TRUE) {
        throw new Exception("cannot open <$filepath>", 500);
    }

    $paths = vocero_traverse_directory();
    foreach ($paths as $path) {
        $relative_path = str_replace(VOCERO_API_ROOT . '../', '', $path);
        if (!vocero_is_deployable($relative_path)) continue;
        $zip->addFile($path, $relative_path);
    }

    $zip->close();

    return $filepath;
}

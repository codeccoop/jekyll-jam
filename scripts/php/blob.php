<?php
$myfile = fopen("../files/blob.json", "r") or die("Unable to open file!");
$blob = json_decode(fread($myfile, filesize("../files/blob.json")), true);
fclose($myfile);

/* $decoded = base64_decode($blob['content']); */
/* preg_match('/\[[^\]]+[^\)]+\)/', $decoded, $matches); */
/* foreach ($matches as $match) { */

/*     # preg_replace() */
/* } */

/* $decoded = preg_replace('/{{ *site\.baseurl *}}/', '', $decoded); */
/* echo $decoded; */


$content = $blob['content'];
preg_match('/\[[^\]]+[^\)]+\)/', $content, $matches_md);
foreach ($matches_md as $match) {
    preg_match('/\([^\)]+\)/', $match, $url);
    if (!preg_match('/^\( *(http|mailto)/', $url[0])) {
        $content = str_replace($url[0], '({{ site.baseurl }}/' . preg_replace('/^ *\//', '', substr($url[0], 1)), $content);
    }
}

preg_match('/(src|href|srcset)=(\"|\')[^\'|\"]+(\'|\")/', $content, $matches_html);
$i = 0;
foreach ($matches_html as $match) {
    $i++;
    if ($i - 1 % 4 != 0) continue;
    preg_match('/(?<=\'|\").+(?=\'|\")/', $match, $url);
    if (!preg_match('/^ *(http|mailto)/', $url[0])) {
        $content = str_replace($url[0], '{{ site.baseurl }}/' . preg_replace('/^ *\//', '', $url[0]), $content);
    }
}

echo $content;

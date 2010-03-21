<?php
// Set your return content type
header('Content-type: application/xml');

$criteria = $_GET['q'];
//$criteria = preg_replace('/\s+/', '+', $criteria);
// Website url to open
$daurl = 'http://cipt2001.homeip.net:8765/gazetteer/index.php?format=xml&q='.urlencode($criteria);
//echo $daurl;
// Get that website's content
$handle = fopen($daurl, "r");

// If there is something, read and return
if ($handle) {
    while (!feof($handle)) {
        $buffer = fgets($handle, 4096);
        echo $buffer;
    }
    fclose($handle);
}
?>
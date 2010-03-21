<?php
	include 'connect.php';
	
	//$latSW = 45.432995535919;
	//$lonSW = 28.051282167434692;
	//$latNE = 45.435009476579765;
	//$lonNE = 28.059006929397583;
	//$cat = Array(1,2,3,11);
	$latSW = $_GET['latSW'];
	$lonSW = $_GET['lonSW'];
	$latNE = $_GET['latNE'];
	$lonNE = $_GET['lonNE'];
	$objs[] = $_GET['objs'];
	$type = $_GET['tip'];
	$objs = $objs[0]; //workaround because of getting array in array
	//print_r($cat);
	$procCat = "(";
	foreach ($objs as $key=>$value) {
		$procCat .= ($value . ",");
	}
	//$l = strlen($procCat);
	//$procCat[$l-1] = ']';
	$procCat = substr_replace($procCat, "", -1);
	$procCat .= ")";
	//print $procCat."<br/>";
	
	$connection = connect();
	mysql_query("SET NAMES 'utf8'");
	$query = "SELECT p.*, s.image FROM pois p INNER JOIN subcategories s ON p.subcat = s.idsub WHERE (p.lat < $latNE) AND (p.lat > $latSW) AND (p.lon < $lonNE) AND (p.lon > $lonSW) AND (p.$type IN $procCat)";
	//print $query."<br/>";
	
	$res = mysql_query($query);
	$response = array();
	while ($row = mysql_fetch_assoc($res)) {
		$response[] = $row;
	}
	//print_r($response);
	//echo "<br/>";
	//echo "<br/>";
	$json = json_encode($response);
	header('Content-Type: text/javascript');
	echo $json;
	exit;
?>
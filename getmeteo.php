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
	$suffix = $_GET['icon'];
	$zoom = $_GET['zoom'];
	
	$connection = connect();
	$query = "SELECT id, nume, CONCAT(id,'$suffix','.png') as image, lat, lon FROM meteo WHERE (activ=1) AND (zoom <= $zoom) AND (lat < $latNE) AND (lat > $latSW) AND (lon < $lonNE) AND (lon > $lonSW)";
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
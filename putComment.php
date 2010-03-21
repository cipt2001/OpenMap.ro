<?php
	include 'connect.php';

	$poiId = $_POST['id'];
	$c = strip_tags($_POST['comm']);
	$uid = 1; //vedem daca implemetam useri
	$d = date("Y-m-d H:i:s");
	$vot = $_POST['stars'];
	$ip = $_SERVER['REMOTE_ADDR'];

	$connection = connect();

	$query = "INSERT INTO comentarii (idpoi, comm, vot, id_user, data, ipaddr) VALUES ($poiId, '$c', $vot, $uid, '$d', '$ip')";
	$res = mysql_query($query);
	if ($res) {
		$vot = 0;
		$voturi = 0;
		$votTitle = array('Fara voturi', 'Foarte slab','Slab','Mediu','Bun','Foarte bun');

		$query = "SELECT count(*), SUM(vot) FROM comentarii WHERE idpoi=$poiId";
		$res = mysql_query($query);
		if (mysql_num_rows($res) > 0){
			$r = mysql_fetch_row($res);
			if ((float)$r[0]>0) {
				$vot = round((float)$r[1] / (float)$r[0]);
				$voturi = $r[0];
			}
		}
		echo "	<img src=\"/images/".$vot."stele.gif\" title=\"$votTitle[$vot]\"/>(".$voturi." voturi)";
	}
	else {
		echo "NOK";
	}
	
?>
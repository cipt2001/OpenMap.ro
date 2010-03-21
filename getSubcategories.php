<?php
	include 'connect.php';
	
	$conn = connect();
	$query = "SELECT * FROM categories ORDER BY idcat";
	$res = mysql_query($query);
	if ($res) {
		while($r=mysql_fetch_array($res)) {
?>
	categorii[<?php echo $r['idcat'];?>] = new Array();
<?php
			$query = "SELECT * FROM subcategories WHERE idcat = ".$r['idcat']." ORDER BY idcat, idsub";
			$result = mysql_query($query);
			if ($result) {
				while ($row=mysql_fetch_array($result)) {
?>  					
	categorii[<?php echo $r['idcat'];?>].push(<?php echo $row['idsub'];?>);
	subcategorii[<?php echo $row['idsub'];?>] = false;
<?php			} 
			} 
		}
	}
?>
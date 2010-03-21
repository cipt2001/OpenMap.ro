<?php
	include 'connect.php';

	$poiId = $_POST['id'];
	$votTitle = array('Fara voturi', 'Foarte slab','Slab','Mediu','Bun','Foarte bun');
	$conn = connect();
	
	$query = "SELECT vot, comm, data FROM comentarii WHERE idpoi=$poiId";
	$res = mysql_query($query);
	if ($res) 
		while ($r = mysql_fetch_array($res)) { ?>
			<div style="margin-bottom:20px">
				<div style="float:left;width:70%">
					<img src="/images/<?php echo $r['vot'];?>stele.gif" title="<?php echo $votTitle[$r['vot']];?>"/>
				</div>
				<div style="float:left;width:30%">
					<?php echo $r['data']; ?>
				</div>
				<div>
					<?php echo $r['comm']; ?>
				</div>
			</div>
<?php
		}
?>

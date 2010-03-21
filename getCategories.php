<?php
	include 'connect.php';

	$conn = connect();
	$query = "SELECT * FROM categories ORDER BY idcat";
	$res = mysql_query($query);
	if ($res) {
		while($r=mysql_fetch_array($res)) {
?>
				<li>  
					<input type="checkbox" name="chk<?php echo $r['idcat'];?>" value="<?php echo $r['idcat'];?>" />  
					<label><?php echo $r['name'];?></label>
<?php
			$query = "SELECT * FROM subcategories WHERE idcat = ".$r['idcat']." ORDER BY idcat, idsub";
			$result = mysql_query($query);
			if ($result) {
?>
					<ul>
<?php
				while ($row=mysql_fetch_array($result)) {
?>  					
						<li>  
							<input type="checkbox" name="chksub<?php echo $row['idsub'];?>" value="<?php echo $row['idsub'];?>" />  
							<label><?php echo $row['name'];?></label>  	
						</li>
<?php			} ?>						
					</ul>
<?php		} ?>						
				</li> 
<?php
		}
	}
?>
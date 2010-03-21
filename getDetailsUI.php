<?php
	include 'connect.php';

	$poiId = $_POST['id'];
	$bn = $_POST['box'];
	
	$contact = "";
	$informatii = "";
	$image = "";
	
	$connection = connect();
	$query = "SELECT * FROM informatii where idpoi = $poiId";
	$res = mysql_query($query);
	if (mysql_num_rows($res) > 0) {
		$row = mysql_fetch_array($res);
		$contact = $row['contact'];
		$informatii = $row['informatii'];
		$image = $row['imagine'];
	}
	if ($image=="") $image="/images/noimage.jpg";
	if ($contact=="") $contact="Nu avem informatii de contact.";
	if ($informatii=="") $informatii="Nu avem alte informatii.";
	
	$votTitle = array('Fara voturi', 'Foarte slab','Slab','Mediu','Bun','Foarte bun');
	
	$vot = 0;
	$voturi = 0;
	//$vot1 = 0.0;
	$query = "SELECT count(*), SUM(vot) FROM comentarii WHERE idpoi=$poiId";
	$res = mysql_query($query);
	if (mysql_num_rows($res) > 0){
		$r = mysql_fetch_row($res);
		if ((float)$r[0]>0) {
			$vot = round((float)$r[1] / (float)$r[0]);
			$voturi = $r[0];
		}
		//$vot1 = (float)$r[1] / (float)$r[0];
	}
?>
	<div id="dialog<?php echo $poiId; ?>">
		<div style="float:left;width:225px;height:146px">
			<div style="float:left" id="stele<?php echo $poiId; ?>">
				<img src="/images/<?php echo $vot;?>stele.gif" title="<?php echo $votTitle[$vot];?>"/>(<?php echo $voturi." voturi"; ?>)
			</div>
			<a style="float:right" id="detalii<?php echo $poiId; ?>" href="#">Detalii</a>
			<div style="clear:both;height:75px;padding:4px"><?php echo $contact; ?></div>
			<div style="padding:4px">
				<a style="float:left" id="setstart<?php echo $poiId; ?>" href="#"><img style="border:none" src="/images/directions/markers/1.png"> Pornire</a>
				<a style="float:right" id="setstop<?php echo $poiId; ?>" href="#">Sosire <img style="border:none" src="/images/directions/markers/2.png"></a>
				<!--div style="float:right"><img src="/images/directions/markers/2.png"><a id="setstop<?php echo $poiId; ?>" href="#">Sosire</a></div-->
			</div>
		</div>	
		<div id="vot<?php echo $poiId; ?>" style="float:left;width:308px;height:146px;padding-left:20px">
			<div>
				Trimite comentariul tau
				<textarea id="comentariu" style="width:308px" rows="2" cols="30"/>
			</div>
			<div>
				<input name="star<?php echo $bn; ?>" type="radio" class="star" value="1" title="Foarte slab"/> 
				<input name="star<?php echo $bn; ?>" type="radio" class="star" value="2" title="Slab"/> 
				<input name="star<?php echo $bn; ?>" type="radio" class="star" value="3" title="Mediu"/> 
				<input name="star<?php echo $bn; ?>" type="radio" class="star" value="4" title="Bun"/> 
				<input name="star<?php echo $bn; ?>" type="radio" class="star" value="5" title="Foarte bun"/>
				<input id="button<?php echo $poiId; ?>" type="button" value="Trimite" style="padding-left=50">
			</div>
		</div>
		<div id="tabs<?php echo $poiId; ?>" style="clear:both">
			<ul>
				<li><a href="#tabinfo<?php echo $poiId; ?>">Informatii</a></li>
				<li><a id="linkcom<?php echo $poiId; ?>" href="#tabcom<?php echo $poiId; ?>">Comentarii (<?php echo $voturi; ?>)</a></li>
			</ul>
			<div id="tabinfo<?php echo $poiId; ?>"><?php echo $informatii; ?></div>
			<div id="tabcom<?php echo $poiId; ?>"></div>
		</div>
	</div>

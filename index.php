<?php
	if (!empty($_COOKIE['_osm_location'])) {
		$c = $_COOKIE['_osm_location'];
		$cs = explode("|", $c);
		//print_r($cs);
		$lon = $cs[0];
		$lat = $cs[1];
		$zoom = $cs[2];
		$layers = $cs[3];		
	}
	else {
		$lat = 45.89;
		$lon = 25.38;
		$zoom = 7;
		$layers = '0B00FTTTTTFF';
	}
	
	if (!empty($_GET['lat'])) {
		$lat = (float)$_GET['lat'];
	}

	if (!empty($_GET['lon'])) {
		$lon = (float)$_GET['lon'];
	}

	if (!empty($_GET['zoom'])) {
		$zoom = (int)$_GET['zoom'];
	}

	if (!empty($_GET['layers'])) {
		$layers = $_GET['layers'];
	}

	if ((!empty($_GET['mlat'])) && (!empty($_GET['mlon']))){
		$mlat = (float)$_GET['mlat'];
		$mlon = (float)$_GET['mlon'];
		$marker = 1;
	}
	else {
		$marker = 0;
		$mlat = 0;
		$mlon = 0;
	}
	$d = date("Ymd", time() - (2 * 24 * 60 * 60));
	$garmin = "http://osm.stilpu.org/garmin-routable/garmin-routable-".$d.".zip";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta content="OpenMap, harta României gratuită, puncte de interes, planificator de rute." name="description" />
    <title>OpenMap - harta României, puncte de interes și planificator rute</title>

<script src="js/jquery-1.3.2.js" type="text/javascript"></script>
<script type="text/javascript">
	var $ = jQuery.noConflict();
</script>
<script type="text/javascript" src="js/site.js"></script>
<script type="text/javascript" src="js/OpenLayers.js"></script>
<script type="text/javascript" src="js/OpenStreetMap.js"></script>
<script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAA_o_1oyOX1uGwg3UUsnLNpRQaHwP9v4qRSzUNYoYWviWYI6eXGxRMcLVLoKD9njABqQbPs152zfO-tQ" type="text/javascript"></script>
<script type="text/javascript" src="js/map.js"></script>
<script type="text/javascript" src="js/directions.js"></script>
<script type="text/javascript" src="js/cloudmade.js"></script>
<script type="text/javascript" src="js/jquery.validate.pack.js"></script>
<script type="text/javascript" src="js/jquery.cookies.2.1.0.js"></script>
<script type="text/javascript" src="http://osm.cdauth.de/map/openstreetbugs.js"></script>
<script type="text/javascript" src="js/messages_ro.js"></script>

<link href="css/directions.css" media="screen" rel="stylesheet" type="text/css" />
<link href="css/site.css" media="screen" rel="stylesheet" type="text/css" />
<link rel="stylesheet" href="css/jquery.rating.css" />
<link rel="stylesheet" href="css/checktreecss" />
<link type="text/css" href="css/redmond/jquery-ui-1.7.1.custom.min.css" rel="stylesheet" />	
<script type="text/javascript" src="js/jquery-ui-1.7.1.custom.min.js"></script>
<script type="text/javascript" src="js/jquery.rating.js"></script>
<script type="text/javascript" src="js/jquery.checktree.js"></script>
<script type="text/javascript" src="js/jquery.qtip-1.0.0-rc3.min.js"></script>

<script type="text/javascript">
	var marker;
	var map;
	var cloudmade, mapnik, osmarender, poisLayer, gLayer, wmsOSM;
	var geocoder
	var CMProjection  = new OpenLayers.Projection('EPSG:4326');
	var OSMProjection = new OpenLayers.Projection('EPSG:900913');
	var directionsData, Utils, directionsManager, parseUrl;

	var boxNumber = 0;
	var poiId;
	var currentZoom = <?php echo $zoom;?>;
	var oldZoom = <?php echo $zoom;?>;
	var openedPois = [];
	var bounds;
	var markers = {};
	var featureSelect;
	var subcategorii = new Array();
	var categorii = new Array();
	var previousLayer;
	var layers = '<?php echo $layers;?>';
	var setMarker = <?php echo $marker;?>;
	var search_qtip;
	var osbControl, osbLayer;
	var locMarker;
	
</script>

<script type="text/javascript" src="getSubcategories.php"></script>
<script type="text/javascript" src="js/search.js"></script>
<script type="text/javascript" src="js/pdi.js"></script>
	
<script type="text/javascript">

  function mapInit(){
    
	map = createMap("map");

    var centre = new OpenLayers.LonLat(<?php echo $lon;?>, <?php echo $lat;?>);
    var zoom = <?php echo $zoom;?>;
    //var centre = new OpenLayers.LonLat(28.05, 45.44);
    //var zoom = 13;

    setMapCenter(centre, zoom);

    map.events.register("moveend", map, updateLocation);
    map.events.register("changelayer", map, updateLocation);
    updateLocation();
	
    handleResize();
  }

  function getPosition() {
    return getMapCenter();
  }

  function setPosition(lat, lon, zoom) {
    var centre = new OpenLayers.LonLat(lon, lat);

    setMapCenter(centre, zoom);

  }
  
  function updateLocation(event) {
    var lonlat = getMapCenter();
    var zoom = map.getZoom();
    var layers = getMapLayers();
	currentZoom = zoom;
    updatelinks(lonlat.lon, lonlat.lat, zoom, layers);

	if ($("#meteo-btn").hasClass("selected")) {
		loadMeteo();
	}
	
	if (layers.charAt(3) == 'B') {
		if (layers.charAt(4) === 'T') {
			if (!$("#hibrid-btn").hasClass('selected')) {
				$("#hibrid-btn").addClass('selected');
				$("#map-btn").removeClass('selected');
				$("#sat-btn").removeClass('selected');
				previousLayer = mapnik;
			}
		}
		else {
			if (!$("#sat-btn").hasClass('selected')) {
				$("#sat-btn").addClass('selected');
				$("#map-btn").removeClass('selected');
				$("#hibrid-btn").removeClass('selected');
				previousLayer = mapnik;
			}
		}
	}
	else {
		if (!$("#map-btn").hasClass('selected')) {
			$("#map-btn").addClass('selected');
			$("#sat-btn").removeClass('selected');
			$("#hibrid-btn").removeClass('selected');
		}
	}
	
	if (currentZoom > 12) {
		if (! $("#notepdi").is(":hidden")) {
			$("#notepdi").slideUp();
		}
	}
	else {
		if ($("#notepdi").is(":hidden")) {
			$("#notepdi").slideDown();
		}
	}
	bounds = map.getExtent();
	if ((currentZoom>12) && !((oldZoom>12) && (currentZoom>oldZoom))) { //elimin cazul in care facem zoom in, daca zoomul anterior era deja >12
		var loadsubcat = getSubcategorii(subcategorii);
		if (loadsubcat.length>0) {
			loadPois('subcat',loadsubcat); 
		}

	}

	oldZoom = currentZoom;

    //document.cookie = "_osm_location=" + lonlat.lon + "|" + lonlat.lat + "|" + zoom + "|" + layers;
	$.cookies.set('_osm_location', lonlat.lon + "|" + lonlat.lat + "|" + zoom + "|" + layers);
  }  

  function resizeContent() {
    var content = document.getElementById("content");
    var rightMargin = 0;
    var bottomMargin = 0;

    content.style.width = document.documentElement.clientWidth - content.offsetLeft - rightMargin;
    content.style.height = document.documentElement.clientHeight - content.offsetTop - bottomMargin;
  }
  
  function resizeMap() {
    var directions_panel = document.getElementById("directions");
    var pdi_panel = document.getElementById("pdi");
    var centre = map.getCenter();
    var zoom = map.getZoom();
	var content_height = document.getElementById("content").offsetHeight;
	var body_height = (document.body.offsetHeight - 43);// + 'px';

    document.getElementById("map").style.left = (pdi_panel.offsetWidth + directions_panel.offsetWidth) + "px";
	var map_width = document.body.offsetWidth - directions_panel.offsetWidth - pdi_panel.offsetWidth - 5;

	$("#mainmenu").width($("#map").width());
	//$("#mainmenu").width(map_width);
	
	$("#map").height(body_height-17);
	$("#directions").height(body_height-47);
	$("#pdi").height(body_height-47);
    map.setCenter(centre, zoom);
  }

  function handleResize() {
    resizeMap();
  }

  function unselectMenus() {
	$("#ruta_button").removeClass('selected');
	$("#pdi_button").removeClass('selected');
	$("#osb_button").removeClass('selected');
	osbControl.deactivate();
	$("#osb_menu").addClass('hidden');
	osbLayer.setVisibility(false);
  }

  function addLocMarker(lonlat) {
	var punct = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
	if (locMarker) {
		directionsManager.markers_layer.removeFeatures([locMarker]);
	}
	locMarker = addMarkerToMap(punct);
	directionsManager.markers_layer.addFeatures([locMarker]);
	directionsManager.permalink_control.update();
  }
  
  function removeLocMarker() {
	if (locMarker) {
		directionsManager.markers_layer.removeFeatures([locMarker]);
		delete locMarker;
		locMarker = undefined;
		directionsManager.permalink_control.update();
	}
  }
  
	function loadMeteo() {

		if (! $("#meteo-btn").hasClass("selected")) {
			meteoLayer.destroyFeatures();
		} else {
			var bounds1 = bounds.clone();
			var boundsArray = bounds1.transform(OSMProjection, CMProjection).toArray(); //left = lonSW, bottom = latSW, right = lonNE, top = latNE
			$.ajax({url:'getmeteo.php', dataType:'json', cache:false, 
				data:{latSW:boundsArray[1], lonSW:boundsArray[0], 
					latNE:boundsArray[3], lonNE:boundsArray[2],
					zoom:currentZoom, icon:'a'}, 
				success: function(data, textStatus) {
					meteoLayer.destroyFeatures();
					for (var i=0; i<data.length;i++){
						var id = data[i].id; 
						var imagine = data[i].image;
						var lonlat = new OpenLayers.LonLat(data[i].lon, data[i].lat).transform(CMProjection, OSMProjection);
						var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);

						var marker_style = {
								pointRadius: 20,
								externalGraphic: '/meteo/'+imagine,
								graphicXOffset: -10,
								graphicYOffset: -10
						};
						var marker = new OpenLayers.Feature.Vector(point, null, marker_style);
						meteoLayer.addFeatures([marker]);
					}
				}
			});
		}
	}
  
	function showLoader(layer) {
		if ((layer.object.name==="CloudMade") || (layer.object.name==="Mapnik") || (layer.object.name==="Osmarender")){
			$("#map-btn").find(".iconb").attr('src', '/images/directions/indicator3.gif');
			return;
		}
		if ((layer.object.name==="Satelit") && (!$("#hibrid-btn").hasClass("selected"))){
			$("#sat-btn").find(".iconb").attr('src', '/images/directions/indicator3.gif');
			return;
		}
		if (layer.object.name==="OSM transparent"){
			$("#hibrid-btn").find(".iconb").attr('src', '/images/directions/indicator3.gif');
		}
		if (layer.object.name==="Transport public"){
			$("#tp-btn").find(".iconb").attr('src', '/images/directions/indicator3.gif');
		}
	}
	
	function hideLoader(layer) {
		if (layer===0) {
			$("#map-btn").find(".iconb").attr('src', '/images/map.gif');
			$("#sat-btn").find(".iconb").attr('src', '/images/earth.png');
			$("#hibrid-btn").find(".iconb").attr('src', '/images/earth-mix.png');
			return;
		}
		if ((layer.object.name==="CloudMade") || (layer.object.name==="Mapnik") || (layer.object.name==="Osmarender")){
			$("#map-btn").find(".iconb").attr('src', '/images/map.gif');
			return;
		}
		if ((layer.object.name==="Satelit") && (!$("#hibrid-btn").hasClass("selected"))){
			$("#sat-btn").find(".iconb").attr('src', '/images/earth.png');
			return;
		}
		if (layer.object.name==="OSM transparent"){
			$("#hibrid-btn").find(".iconb").attr('src', '/images/earth-mix.png');
		}
		if (layer.object.name==="Transport public"){
			$("#tp-btn").find(".iconb").attr('src', '/images/bus.png');
		}
	}
  
	function showLoaderOld() {
		$("#loader").css('position', 'absolute');
		$("#loader").css('top', parseInt((document.body.offsetHeight - 43)/2-40));
		$("#loader").css('left', parseInt((document.body.offsetWidth - 215)/2+212));
		$("#loader").removeClass('hidden');
	}
  
	function hideLoaderOld() {
		$("#loader").addClass('hidden');
	}
  
	function StartMe() {
	    mapInit();
	    loadCategories();
	  
	    window.onload = handleResize;
		window.onresize = handleResize;
	  
	  
	    directionsData = new OSM.DataModel();
	    Utils = new OSM.Utils();
	    directionsManager = new OSM.DirectionsManager();
		
		poisLayer = new OpenLayers.Layer.Vector('POIS');
		meteoLayer = new OpenLayers.Layer.Vector('Meteo');
		searchLayer = new OpenLayers.Layer.Vector('Search');
	    directionsManager.vectors_layer = new OpenLayers.Layer.Vector('Vectors');
		directionsManager.markers_layer = new OpenLayers.Layer.Vector('Markers');
		map.addLayers([meteoLayer,poisLayer,searchLayer,directionsManager.vectors_layer,directionsManager.markers_layer]);
		//Adding the transport overlay last
		map.addLayer(wmsTP);
		osbLayer = new OpenLayers.Layer.OpenStreetBugs("OpenStreetBugs", {
			visiblity:false
		});
		OpenLayers.Lang.setCode('ro');
		map.addLayer(osbLayer); // map is your instance of OpenLayers.Map
		osbControl = new OpenLayers.Control.OpenStreetBugs(osbLayer, {
			icon : new OpenLayers.Icon("/images/icon_error_add.png", new OpenLayers.Size(22, 22), new OpenLayers.Pixel(-11, -11)) // This icon [1] will be displayed temporarily on the map when you add a bug and will be connected to the “create bug” popup
		});
		map.addControl(osbControl); // map is your instance of OpenLayers.Map
		setMapLayers('<?php echo $layers;?>');
	
		var setMarker = <?php echo $marker; ?>;
		if (setMarker == 1) {
			var lonlat = new OpenLayers.LonLat(<?php echo $mlon; ?>, <?php echo $mlat; ?>).transform(CMProjection, OSMProjection);
			addLocMarker(lonlat);
			//var punct = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
			//locMarker = addMarkerToMap(punct);
			//directionsManager.markers_layer.addFeatures([locMarker]);
		}
		
		//featureSelect = new OpenLayers.Control.SelectFeature([poisLayer], {
		featureSelect = new OpenLayers.Control.SelectFeature([poisLayer,searchLayer,directionsManager.vectors_layer,directionsManager.markers_layer], {
			clickout: true, toggle: false,
			multiple: false, hover: false,
			toggleKey: "ctrlKey", // ctrl key removes from selection
			multipleKey: "shiftKey" // shift key adds to selection
		});
		map.addControl(featureSelect);
		featureSelect.activate();
		poisLayer.events.on({
			"featureselected": SelectPOI
			}
		);
		
		$("#ruta_button").bind('click', function(){
			$("#directions").removeClass('hidden');
			$("#pdi").addClass('hidden');
			unselectMenus();
			osbControl.deactivate();
			featureSelect.activate();
			osbLayer.setVisibility(false);
			poisLayer.setVisibility(true);
			$(this).addClass("selected");
		});

		$("#pdi_button").bind('click', function(){
			$("#pdi").removeClass('hidden');
			$("#directions").addClass('hidden');
			unselectMenus();
			osbControl.deactivate();
			featureSelect.activate();
			osbLayer.setVisibility(false);
			poisLayer.setVisibility(true);
			$(this).addClass("selected");
			search_qtip.qtip("hide");
		});

		$("#osb_button").bind('click', function(){
			unselectMenus();
			$(this).addClass("selected");
			osbControl.activate();
			featureSelect.deactivate();
			osbLayer.setVisibility(true);
			poisLayer.setVisibility(false);
			//meteoLayer.setVisibility(false);
			//searchLayer.setVisibility(false);
			//directionsManager.vectors_layer.setVisibility(false);
			//directionsManager.markers_layer.setVisibility(false);
			$("#osb_menu").removeClass('hidden');
		});
		
		$("#exemple").bind('click', function(){
				$("#searchExamples").removeClass("hidden");			
				$("#searchExamples").dialog({
					autoOpen: true,
					width: 595,
					height:404,
					zIndex:3000000,
					buttons: {
							"OK":function(){
								$(this).dialog("close");
							}
						},
					resizable:false,
					title:"Exemple de căutări posibile",
					close: function() {
						$(this).dialog('destroy');
						$("#searchExamples").addClass("hidden");
					}});
		});
		
		$("#edit_button").bind('click', function(){
			if (currentZoom<13) {
				$("#lowzoomForm").removeClass("hidden");			
				$("#lowzoomForm").dialog({
					autoOpen: true,
					width: 295,
					height:104,
					zIndex:3000000,
					buttons: {
							"OK":function(){
								$(this).dialog("close");
							}
						},
					resizable:false,
					title:"Editează harta",
					close: function() {
						$(this).dialog('destroy');
						$("#lowzoomForm").addClass("hidden");
					}});
			} 
			else {
				//new dialog that will present OSM will belong here and the code below will be executed when OK is pressed
				cc = $.cookies.get('_showOSMInfo');
				if (cc=="true") {
					var center = map.center;
					center = Utils.transformLatLngToCM(center);
					var edit_url = "http://www.openstreetmap.org/edit?lat=";
					edit_url = edit_url + center.lat.toString();
					edit_url = edit_url + "&lon=";
					edit_url = edit_url + center.lon.toString();
					edit_url = edit_url + "&zoom="+currentZoom.toString();
					document.location.href = edit_url;
				}
				else {
					$("#editForm").removeClass("hidden");
					$('#edit_cb').attr("checked", false);
					$("#editForm").dialog({
						autoOpen: true,
						width: 535,
						height:434,
						zIndex:3000000,
						buttons: {
								"OK":function(){
									//set cookie
									$.cookies.set('_showOSMInfo', $('#edit_cb').attr("checked"));
									var center = map.center;
									center = Utils.transformLatLngToCM(center);
									var edit_url = "http://www.openstreetmap.org/edit?lat=";
									edit_url = edit_url + center.lat.toString();
									edit_url = edit_url + "&lon=";
									edit_url = edit_url + center.lon.toString();
									edit_url = edit_url + "&zoom="+currentZoom.toString();
									$(this).dialog("close");
									document.location.href = edit_url;
								},
								"Anulare":function(){
									$(this).dialog("close");
								}
							},
						resizable:false,
						title:"Editează harta",
						close: function() {
							$(this).dialog('destroy');
							$("#editForm").addClass("hidden");
						}});
				}
			}
		});
		
		$("#tp-btn").click(function() {
			$(this).toggleClass("selected");
			if ($(this).hasClass("selected")) {
				wmsTP.setVisibility(true);
			}
			else {
				wmsTP.setVisibility(false);
			}
		});

		/*$("#osb-btn").click(function() {
			$(this).toggleClass("selected");
			if ($(this).hasClass("selected")) {
				osbControl.activate();
				featureSelect.deactivate();
			}
			else {
				osbControl.deactivate();
				featureSelect.activate();
			}
		});*/

		$("#meteo-btn").click(function() {
			$(this).toggleClass("selected");
			loadMeteo();
		});
		$("#meteo-btn").hover(function(){
			if (! $(this).hasClass("selected")) {
				$("#meteo-img").attr('src', '/images/clouds.png');
			}
		},function(){
			if (! $(this).hasClass("selected")) {
				$("#meteo-img").attr('src', '/images/meteo.png');
			}
		});
		
		if (layers.charAt(3)=='B') {
			$("#map-btn").removeClass('selected');
			if (layers.charAt(4)==='T') { //mod hibrid
				$("#hibrid-btn").addClass('selected');
			}
			else { //doar satelit
				$("#sat-btn").addClass('selected');
			}
			previousLayer = mapnik;
		}
		
		$("#map-btn").click(function(){
			if (! $(this).hasClass("selected")) {
				hideLoader(0);
				$(this).addClass("selected");
				$("#sat-btn").removeClass("selected");
				$("#hibrid-btn").removeClass("selected");
				map.getLayersByName("OSM transparent")[0].setVisibility(false);
				map.setBaseLayer(previousLayer);
			}
		});
		$("#sat-btn").click(function(){
			if (! $(this).hasClass("selected")) {
				hideLoader(0);
				$(this).addClass("selected");
				$("#map-btn").removeClass("selected");
				$("#hibrid-btn").removeClass("selected");
				if (map.baseLayer.name!=="Satelit") {
					previousLayer = map.baseLayer;
				}
				map.getLayersByName("OSM transparent")[0].setVisibility(false);
				map.setBaseLayer(map.getLayersByName("Satelit")[0]);
			}
		});
		$("#hibrid-btn").click(function(){
			if (! $(this).hasClass("selected")) {
				hideLoader(0);
				$(this).addClass("selected");
				$("#map-btn").removeClass("selected");
				$("#sat-btn").removeClass("selected");
				if (map.baseLayer.name!=="Satelit") {
					previousLayer = map.baseLayer;
				}
				map.setBaseLayer(map.getLayersByName("Satelit")[0]);
				map.getLayersByName("OSM transparent")[0].setVisibility(true);
			}
		});
		
		cloudmade.events.register('loadstart', cloudmade, showLoader);
		cloudmade.events.register('loadend', cloudmade, hideLoader);
		mapnik.events.register('loadstart', mapnik, showLoader);
		mapnik.events.register('loadend', mapnik, hideLoader);
		osmarender.events.register('loadstart', osmarender, showLoader);
		osmarender.events.register('loadend', osmarender, hideLoader);
		gLayer.events.register('loadstart', gLayer, showLoader);
		gLayer.events.register('loadend', gLayer, hideLoader);
		wmsOSM.events.register('loadstart', wmsOSM, showLoader);
		wmsOSM.events.register('loadend', wmsOSM, hideLoader);
		wmsTP.events.register('loadstart', wmsTP, showLoader);
		wmsTP.events.register('loadend', wmsTP, hideLoader);

		if (wmsTP.getVisibility()===true) {
			$("#tp-btn").addClass("selected");
		}
		
		$("#contact_button").bind('click', function(){
			$("#contactForm").removeClass("hidden");			
			$("#contactForm").dialog({
				autoOpen: true,
				width: 495,
				height:384,
				zIndex:3000000,
				resizable:false,
				title:"Contactează-ne",
				close: function() {
					$(this).dialog('destroy');
					$("#contactForm").addClass("hidden");
					$("#messageSent").addClass("hidden");
					$("#validationError").addClass("hidden");
				}});
		});
		
		$("#mycontact").validate({
			showErrors: function(errorMap, errorList) {
					if (errorList.length>0) {
						$("#messageSent").addClass("hidden");
						$("#validationError").html(errorList[0].message);
						$("#validationError").removeClass("hidden");
					} else {
						$("#validationError").addClass("hidden");
						$.ajax({
							type:'POST',
							url:'sendmail.php',
							data:{	nume:$("#Name").attr("value"), 
									email:$("#Email").attr("value"), 
									subiect:$("#Subiect").attr("value"),
									mesaj:$("#Mesaj").attr("value")
								}, 
							success: function(data, textStatus) {
									$("#messageSent").removeClass("hidden");
									$("#Name").attr("value","");
									$("#Email").attr("value","");
									$("#Subiect").attr("value","");
									$("#Mesaj").attr("value","");
								},
							error:function(XMLHttpRequest, textStatus, errorThrown){ //continue ajax call
									$("#validationError").html("Eroare la trimiterea mesajului. Vă rugăm reîncercați!");
									$("#validationError").removeClass("hidden");
								}
						});
					}
				},
			onkeyup:false,
			onfocusout: false,
			submitHandler:function() {	
					return false;
				},
			messages : {
				Name: "Vă rugăm să ne comunicați numele dumneavoastră",
				Email: {required: "Vă rugăm să ne comunicați email-ul dumneavoastră",
						email: "Adresa de email trebuie să fie validă"},
				Subiect: "Mesajul trebuie să aibă un subiect",
				Mesaj: "Vă rugăm să completați mesajul"
			}
		});
		$("#inputs_list").children().children(".point_description").bind('keyup', getCoordinatesNew);
		//directionsManager.reloadIndexes();
		search_qtip = $('#searchA').qtip({
		   content: 'Scrie ce dorești să cauți și apasă Enter. Exemple de căutare găsiți dând click pe link-ul de mai sus.',
		   position: {corner: {target:'bottomRight', tooltip: 'topLeft'}, adjust: {x: -5,y: -5}},
		   show: {ready: true},
		   hide: {when: {event: 'mouseout'}},
		   style: {name: 'light', tip: {corner: 'topLeft', size: {x:8, y:8}}, border:{width: 2, color: '#FF9933'}}
		});
  }  
  
  jQuery(function() {
	StartMe();
  });
</script>

</head>
<body>
<div id="top">
<div id="logo">
<img src="/images/menu/logo.png">
</div>

<div id="versiune">0.2.6</div>

<div id="layer_menu">
	<div class="buttons">
	    <a class="positive selected" id="map-btn">
	        <img class="iconb" src="/images/map.gif" alt=""/> 
	        Hartă
	    </a>
	    <a class="positive" id="sat-btn">
	        <img class="iconb" src="/images/earth.png" alt=""/> 
	        Satelit
	    </a>
	    <a class="positive" id="hibrid-btn">
	        <img class="iconb" src="/images/earth-mix.png" alt=""/> 
	        Hibrid (beta)
	    </a>
	</div>
</div>
<div id="opt_menu">
	<div class="buttons">
	    <a class="positive" id="meteo-btn">
	        <img id="meteo-img" src="/images/meteo.png" alt=""/> 
	        Meteo
	    </a>
	    <a class="positive" id="tp-btn">
	        <img class="iconb" src="/images/bus.png" alt=""/> 
	        Transport public (experiment)
	    </a>
	</div>
</div>

<div id="mainmenu">
  <ul>
    <li><a id="ruta_button" class="selected" href="#" title="Rută"><span>Rută</span></a></li>
    <li><a id="pdi_button" href="#" title="Puncte de interes"><span>Puncte de interes</span></a></li>
    <li><a id="osb_button" href="#" title="Raportează o eroare"><span>Raportează o eroare</span></a></li>
    <li><a id="edit_button" href="#" title="Editează harta"><span>Editează harta</span></a></li>
    <li><a id="edit_button" href="<?php echo $garmin; ?>" title="Harta în format Garmin"><span>Harta în format Garmin</span></a></li>
  </ul>
  <ul style="float:right;margin-right:-50px;margin-top:-10px;">
    <li><a id="contact_button" href="#" title="Contact"><span>Contact</span></a></li>
  </ul>
</div>
</div>
<div id="optAfisare"></div>
<div id="content">
	<div id="pdi" class="hidden">
	  <div class="clear1"></div>
	  <div class="separator1"></div>
	  <div class="sectionTitle">Puncte de interes</div>
	  <div id="notepdi">Punctele de interes apar pe hartă doar dacă faceți zoom-in</div>
		<ul class="tree" id="categorii">  
		</ul>
	</div>
	<!--Next div used for  showing popup-->
	<div id="detalii" title="" style="display: none;"></div>

	<div id="directions">
	  
	  <!--a href="#" id="close_routing">Close</a-->
	  <div class="clear1"></div>
	  <div class="separator1"></div>
	  <div class="sectionTitleDirection">Calcul rută <a id="exemple">(click pentru exemple)</a></div>
	  
	  <ul id="inputs_list">
	    
	    <li>
	      <a class="label" href="#">a</a>
	      <input id="searchA" type="text" class="point_description" />
		  <div class="loader hidden">
			<img src="/images/directions/indicator2.gif"></img>
		  </div>
	      <a class="set_point" href="#"></a>
	      <a class="replace_points unvisible" href="#"></a>
	      <a class="remove_point unvisible" href="#"></a>
	    </li>
	    
	    <li>
	      <a class="label" href="#">b</a>
	      <input type="text" class="point_description" />
		  <div class="loader hidden">
			<img src="/images/directions/indicator2.gif"></img>
		  </div>
	      <a class="set_point" href="#"></a>
	      <a class="replace_points" href="#"></a>
	      <a class="remove_point unvisible" href="#"></a>
	    </li>
	    
	    <li>
	      <a class="label" href="#">c</a>
	      <a id="add_destination" href="#">Adaugă destinație</a>
	      <a id="clear_route" class="unvisible" href="#">Șterge rută</a>
	    </li>
	    
	  </ul>
	  
	  <div class="clear"></div>
	  <ul id="transport_switcher">
	    
	    <li class="active">
	      <span class="bg"></span>
	      <a id="by_car" href="#">
	        <span class="icon">&nbsp;</span>
	        auto
	      </a>
	    </li>
	    
	    <li>
	      <span class="bg"></span>
	      <a id="by_walking" href="#">
	        <span class="icon">&nbsp;</span>
	        pieton
	        
	      </a>
	    </li>

	    <li>
	      <span class="bg"></span>
	      <a id="by_cycling" href="#">
	        <span class="icon">&nbsp;</span>
	        bicicletă
	        
	      </a>
	    </li>
	    
	  </ul>
	  
	  <label class="label">Preferințe</label>
	  <select id="preferences">
	    <option>cel mai rapid</option>
	    <option>cel mai scurt</option>
	  </select>

	  <div class="separator"></div>
	  
	  <div id="start_text"><span > ! </span>Pentru a începe, click dreapta pe harta pentru a alege punctul de plecare sau sosire</div>

	  <div id="loadingIndicator" class="loading_indicator hidden">
	    <p>Încarcă...</p>
	    <img src="/images/directions/indicator.gif"></img>
	  </div>
	  <div id="output_panel"></div>
	  
	</div>
	<div id="map">
	</div> 

	<div class="buttons" id="newlink">
	    <a class="positive" id="permalinkanchor" href="/index.php">
		  <img src="/images/link.gif" alt=""/>Permalink
		</a>
	</div>

</div>

<div id="contactForm" class="hidden">
	<p>Pentru orice informații sau dacă aveți probleme în utilizarea acestei 
	aplicații vă rugăm să ne scrieți pe adresa <a href="mailto:contact@openmap.ro">contact@openmap.ro</a> 
	sau să utilizați formularul de mai jos.</p>
	<form id="mycontact">
		<fieldset>
			<label for="Name">Nume *</label>
			<input id="Name" name="Name" type="text" class="required" />
			<label for="Email">Adresa de e-mail *</label>
			<input id="Email" name="Email" type="text" class="required email" />
			<label for="Subiect">Subiect *</label>
			<input id="Subiect" name="Subiect" type="text" class="required" />
			<label for="Mesaj">Mesaj *</label>
			<textarea id="Mesaj" name="Mesaj" rows="3" cols="20" class="required"></textarea>
			<input id="sendMail" type="submit" name="submit" value="Trimite mesaj"/>
			<span id="messageSent" class="hidden">Mesajul dumneavoastră a fost trimis!</span>
			<span id="validationError" class="hidden">bla bla bla</span>
		</fieldset>
	</form>
</div>

<div id="lowzoomForm" class="hidden">
	<p>Pentru a edita harta trebuie să faceți zoom-in!</p>
</div>

<div id="editForm" class="hidden">
	<p align="justify">OpenMap.ro utilizează datele din cadrul proiectului <a href="http://www.openstreetmap.org">OpenStreetMap</a> (OSM). Astfel veți fi redirectat către site-ul OSM, unde veți putea face modificările ce vor fi reintegrate pe OpenMap.ro în aproximativ o săptămână. Pentru a edita harta va trebui să creați un cont pe site-ul OSM după ce apăsați butonul OK. Dacă aveți deja un cont de contribuitor OSM va trebui să vă logați.<br><br>
	<b>Câteva cuvinte despre OSM:</b><br>
	OpenStreetMap este un proiect open-source ce dorește să ofere o bază de date geo-spațiale liberă. Din acest punct de vedere poate fi privit ca o Wikipedia pentru hărți. <br><br>
	<b>Prin ce diferă OSM față de alte servicii gen GoogleMaps, YahooMaps?</b>
	Principala diferență este faptul că datele OSM pot fi utilizate în orice proiect (inclusiv comercial) cât timp sunt respectați termenii licenței sub care sunt distribuite datele OSM și produsele derivate din acele date <a gref="">CC-BYSA 2.0</a>. O altă diferență majoră este că datele sunt oferite in format vectorial, pe când serviciile gen GoogleMaps oferă acces la un mozaic de imagini.
	</p>
	<input id="edit_cb" type="checkbox"> Nu mai afișa această fereastră data viitoare
</div>
<div id="searchExamples" class="hidden">
	<p align="justify">OpenMap.ro vă permite să efectuați căutări la nivelul României, inclusiv până la nivel de număr de stradă (acolo unde datele sunt disponibile). Iată câteva exemple de căutări:
	<ul><li>caută o localitate: este suficient numele localității sau chiar numai o parte din acesta (diacriticele nu sunt necesare, nu se face diferență între litere mici și mari).
			<ul><li><i>Galati</i></li>
			<li><i>sighetu</i></li></ul>
		</li>
	</ul>
	<ul><li>caută o stradă într-o anumită localitate: va trebui să specificați numele străzii și apoi numele localității (eventual separate prin virgulă, ordinea este importantă).
			<ul><li><i>universitatii, galati</i></li>
			<li><i>galati bucuresti</i> (a se observa ordinea, în cazul de față se caută strada galati din localitatea bucuresti)</li></ul>
		</li>
	</ul>
	<ul><li>caută un număr de pe o stradă, dintr-o localitate: ordinea pe care va trebui să o specificați este: numărul dorit, urmat de numele străzii și apoi numele localității.
			<ul><li><i>17, universitatii, galati</i></li>
			<li><i>13, studioului, bucuresti</i></li></ul>
		</li>
	</ul>
	</p>
</div>
<div id="loader" class="loading_indicator hidden">
	<p>Încarcă...</p>
	<img src="/images/ajax-loader.gif"></img>
</div>
<script type="text/javascript">
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
try {
var pageTracker = _gat._getTracker("UA-7334516-2");
pageTracker._trackPageview();
} catch(err) {}</script>
</body>
</html>
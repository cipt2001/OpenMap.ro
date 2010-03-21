function SelectPOI(e) {
	//console.log("Selecting feature "+e.feature.myid+" on poisLayer");
	$("#detalii").attr({title:e.feature.title});
	var titlu = e.feature.title;
	poiId = e.feature.myid;
	var longlat = e.feature.longlat;
	if (openedPois[poiId]!==true) {//nu avem deja deschisa o fereastra cu Poi-ul
		boxNumber++;
		var res = $.post("getDetailsUI.php", {id:e.feature.myid, box:boxNumber}, function(data) {
			//$("#detalii").hide();
			//this.id = poiId;
			//console.log("back from post "+poiId);
			content[poiId] = $(data).dialog({
				autoOpen: false,
				width: 255,
				height:194,
				zIndex:3000000,
				resizable:false,
				title:titlu,
				open: function(event, ui) {
					openedPois[poiId] = true;
					this.mic = true;
					this.idp = poiId;
					this.longlat = longlat;
					//console.log("opening poiid "+poiId);
					this.reloadComments = true;
					this.tabs = $("#tabs"+poiId).tabs();
					$('#tabs'+poiId).bind('tabsselect', function(event, ui) {
						//console.log("select "+ui.index);
						if (ui.index==1) { //daca am selectat pagina de comentarii
							if (this.parentNode.reloadComments) {
								//console.log("reload");
								reloadComments(this.parentNode.idp);
								this.parentNode.reloadComments = false;
							}
							else {
								//console.log("did not reload");
							}
						}
					});
					$("#tabs"+this.idp).hide();
					$("#vot"+this.idp).hide();
					$("#detalii"+this.idp).click(function() {
						this.idp = this.parentNode.parentNode.idp; //!!!!!!Atentie daca se modifica structura HTML-ul returnat de post.
						if (this.parentNode.parentNode.mic===true) {
							$("#dialog"+this.idp).dialog('option','width',600);
							$("#dialog"+this.idp).dialog('option','height',450);
							$("#dialog"+this.idp).attr({style:'height:388px; min-height:88px; width:auto'});
							$("#tabs"+this.idp).show();
							$("#vot"+this.idp).show();
							
						}
						else {
							$("#tabs"+this.idp).hide();
							$("#vot"+this.idp).hide();
							$("#dialog"+this.idp).dialog('option','width',265);
							$("#dialog"+this.idp).dialog('option','height',214);//e posibil sa tb sa modifici si mai jos pt IE
							$("#dialog"+this.idp).attr({style:'height:170px; min-height:88px; width:auto'});
						}
						this.parentNode.parentNode.mic = !this.parentNode.parentNode.mic;
						return false;
					});
					$("#button"+this.idp).click(function(){
						this.idp = this.parentNode.parentNode.parentNode.idp; //!!!!!!Atentie daca se modifica structura HTML-ul returnat de post.
						//console.log("submit form"+this.idp);
						var stars = $('#vot'+this.idp+' > * > input[name=star'+boxNumber+']').val();
						//if (stars=="")
							//console.log("no rating");
						//else
							//console.log(stars);
						com = $("#comentariu").val();
						poiId = this.idp;
						$.post("putComment.php", {id:this.idp, comm:com, stars:stars}, function(data){
							//console.log("inside post callback");
							this.idp = poiId;
							if (data=="NOK") {
								//console.log("data NOK");
								$("#vot"+this.idp).append("Votul nu a putut fi prelucrat");
							}
							else {
								//console.log("data OK idp:"+this.idp);
								$("#stele"+this.idp).html(data);
								$("#vot"+this.idp).html("Votul a fost adaugat");
								var s1 = data.match(/\d+ voturi/);
								var s2 = s1[0].match(/\d+/);
								$("#linkcom"+this.idp).text("Comentarii ("+s2[0]+")");
								$("#dialog"+poiId)[0].reloadComments = true;
							}
						});
						
						//var ret = $.post('', {}, 
						//return false;
					});
					$("#setstart"+this.idp).click(function(){
						this.idp = this.parentNode.parentNode.parentNode.idp; //!!!!!!Atentie daca se modifica structura HTML-ul returnat de post.
						var lonlat = this.parentNode.parentNode.parentNode.longlat; //!!!!!!Atentie daca se modifica structura HTML-ul returnat de post.
						directionsManager.addStartPoint(lonlat, directionsManager);
						$("#dialog"+this.idp).dialog("close");
					});
					$("#setstop"+this.idp).click(function(){
						this.idp = this.parentNode.parentNode.parentNode.idp; //!!!!!!Atentie daca se modifica structura HTML-ul returnat de post.
						var lonlat = this.parentNode.parentNode.parentNode.longlat; //!!!!!!Atentie daca se modifica structura HTML-ul returnat de post.
						directionsManager.addEndPoint(lonlat, directionsManager);
						$("#dialog"+this.idp).dialog("close");
					});

				},
				close: function(event, ui) {
					$(this).dialog('destroy');
					$(this).remove();
					openedPois[poiId] = false;
				}
			});
			$tabs = $("#tabs"+poiId).tabs();
			content[poiId].dialog('open');
		});//post
	}
	featureSelect.unselect(e.feature);
}

function reloadComments(myid) {
		$.post("getComments.php", {id:myid}, function(data) {
			$("#tabcom"+myid).html(data);
		});
	}
	
function removePois(tip, subcat) {
	//console.log('Hide pois from cat: '+subcat);
	var m;
	if (tip=="cat") {
		for (m in markers) {
			if (markers[m].cat==subcat) {
				//poisLayer.removeMarker(markers[m]);
				poisLayer.removeFeatures([markers[m]]);
				markers[m].destroy();
				delete markers[m];
			}
		}	
	}
	else if (tip=="subcat") {
		for (m in markers) {
			if (markers[m].subcat==subcat) {
				//poisLayer.removeMarker(markers[m]);
				poisLayer.removeFeatures([markers[m]]);
				markers[m].destroy();
				delete markers[m];
			}
		}
	}
}

function getSubcategorii(subcats) {
	var myret = [];
	for(var i in subcats) {
		if (subcats[i]===true) {
			myret.push(i);
		}
	}
	return myret;
}

function loadPois(criteriu, valoare) { //criteriu: cat, cats[], subcat, subcats[]
	//console.log('Load pois from '+criteriu+': '+valoare);
	var testme = ""+criteriu+"";
	//$("#loader").show();
	var bounds1 = bounds.clone();
	var boundsArray = bounds1.transform(OSMProjection, CMProjection).toArray(); //left = lonSW, bottom = latSW, right = lonNE, top = latNE
	//console.log(boundsArray);
	$.ajax({url:'getpois.php', dataType:'json', cache:false, 
		data:{latSW:boundsArray[1], lonSW:boundsArray[0], 
			latNE:boundsArray[3], lonNE:boundsArray[2],
			tip:criteriu, "objs[]":valoare}, 
		success: function(data, textStatus) {
			//$("#logo").append("inside ajax data len "+data.length+ "blabla");
		
			for (var i=0; i<data.length;i++){
				//$("#logo").append(data[i].id);
				//$("#logo").append(","+i+" ");
				var id = data[i].id; 
				var cat = data[i].cat;
				var subcat = data[i].subcat;					
				var imagine = data[i].image;
				if (markers[id] === undefined){
					var lonlat = new OpenLayers.LonLat(data[i].lon, data[i].lat).transform(CMProjection, OSMProjection);
					var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
					if (imagine === undefined) {
						//console.log('no imagine');
						imagine = "viewpoint.png";
					}
					//var icon = new OpenLayers.Icon("/images/subcats/"+imagine, new OpenLayers.Size(20, 20), new OpenLayers.Pixel(-10,-10));
					var marker_style = {
							pointRadius: 10,
							externalGraphic: "/images/subcats/"+imagine,
							graphicXOffset: -10,
							graphicYOffset: -10,
							graphicTitle: data[i].name
					};
					var marker = new OpenLayers.Feature.Vector(point, null, marker_style);
					//var marker = new OpenLayers.Marker(lonlat, icon);
					marker.myid = id;
					marker.cat = cat;
					marker.subcat = subcat;
					marker.longlat = lonlat;
					marker.title = data[i].name;// + " - " + subcat;
					//console.log(marker.id);
					markers[id] = marker;
					poisLayer.addFeatures([marker]);
					//poisLayer.addMarker(marker);
					//map.addOverlay(marker);
					//CM.Event.addListener(marker, 'click', function() {
				}
				//else {
				//	markers[id].style="display:block";
					//if (markers[id].isHidden()) {
						//$("#logo").append("showing, ");
						//markers[id].show();
						//console.log('showing '+id);
					//}
				//}
			}
			//$("#loader").hide();
		},
		error:function(XMLHttpRequest, textStatus, errorThrown){ //continue ajax call
			//$("#loader").hide();
			$("#logo").text('Error');
		}
	});
	//should we destroy array valoare?
	valoare = null;
}

function loadCategories() {
		$.post("getCategories.php", {}, function(data) {
			$("#categorii").html(data);
			$(".tree").checkTree({
				onCheck:function(item){
					var input = item.children('input')[0];
					if (input!==null) { //we have found a checkbox probably :)
						var nume = input.name;
						var subcat = [input.value];
						if (nume.indexOf('chksub')>=0) {//we have checked a subcateogry, load the corresponding pois
							if (currentZoom>12) {
								loadPois("subcat", subcat);
							}
							subcategorii[input.value] = true;
						}
						else {
							////console.log("Check category");
							if (currentZoom>12) {
								loadPois("cat", subcat);
							}
							for(var i=0;i<categorii[input.value].length;i++) {
								subcategorii[categorii[input.value][i]] = true;
							}
						}
					}
					else {
						//console.log('no checkbox');
					}
				},
				onUnCheck:function(item) {
					var input = item.children('input')[0];
					if (input!==null) { //we have found a checkbox probably :)
						var nume = input.name;
						var subcat = input.value;
						if (nume.indexOf('chksub')>=0) {//we have checked a subcateogry, load the corresponding pois
							removePois("subcat", subcat);
							subcategorii[input.value] = false;
						}
						else {
							////console.log("UnCheck category");
							removePois("cat", subcat);
							for(var i=0;i<categorii[input.value].length;i++) {
								subcategorii[categorii[input.value][i]] = false;
							}
						}
					}
					else {
						//console.log('no checkbox');
					}
				}
			});
		});		
	}
	